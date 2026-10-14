import { z } from "zod";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  like,
  lte,
  ne,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { draft as base } from "../middleware/draft";
import { admin } from "../middleware/auth";
import { db } from "../database";
import {
  listings as listingsTable,
  advisors as advisorsTable,
} from "../database/schema";
import { resolveMedia } from "../lib/s3";
import { auth } from "../auth";
import { publishBrochure } from "../lib/publish-brochure";

export const TYPES = [
  "house",
  "apartment",
  "condo",
  "retail",
  "commercial",
  "land",
] as const;

type Row = typeof listingsTable.$inferSelect;

export async function present(row: Row, owner = false) {
  const resolved = await Promise.all(
    row.images.map(async (ref) => ({ ref, url: await resolveMedia(ref) })),
  );
  const ok = resolved.filter((m): m is { ref: string; url: string } => !!m.url);
  const directory = row.advisorIds.length
    ? await db
        .select()
        .from(advisorsTable)
        .where(inArray(advisorsTable.id, row.advisorIds))
    : [];
  const agents = row.advisorIds.length
    ? row.advisorIds
        .map((id) => directory.find((a) => a.id === id))
        .filter((a): a is (typeof directory)[number] => !!a)
    : row.agents;
  return {
    ...row,
    price: !owner && row.priceDisplay === "on-request" ? null : row.price,
    brochureUrl:
      row.publication === "published"
        ? await resolveMedia(row.brochureRef)
        : null,
    imageUrls: ok.map((m) => m.url),
    /** Stored refs aligned 1:1 with imageUrls (used by the AI visualiser). */
    imageRefs: ok.map((m) => m.ref),
    floorPlanUrl: await resolveMedia(row.floorPlanImage),
    advisorProfiles: await Promise.all(
      agents.map(async (agent) => ({
        ...agent,
        imageUrl: await resolveMedia(agent.image),
      })),
    ),
  };
}

const filterInput = z.object({
  type: z.enum(TYPES).optional(),
  deal: z.enum(["sale", "rent", "stay"]).optional(),
  district: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minBeds: z.number().optional(),
  minSqm: z.number().optional(),
  q: z.string().optional(),
  sort: z
    .enum(["newest", "price-asc", "price-desc", "size-desc"])
    .default("newest"),
  featured: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(60),
});

const listingInput = z
  .object({
    ref: z.string().trim().min(1).max(80),
    type: z.enum(TYPES),
    deal: z.enum(["sale", "rent", "stay"]),
    priceDisplay: z
      .enum(["numeric", "on-request", "starting-from"])
      .default("numeric"),
    negotiable: z.boolean().default(false),
    advisorIds: z.array(z.number().int().positive()).max(2).default([]),
    status: z
      .enum(["available", "reserved", "sold", "rented"])
      .default("available"),
    title: z.string().min(1),
    titleTh: z.string().nullish(),
    summary: z.string().default(""),
    summaryTh: z.string().nullish(),
    description: z.string().default(""),
    descriptionTh: z.string().nullish(),
    price: z.number().int().nonnegative(),
    areaSqm: z.number().nonnegative().nullish(),
    landSqm: z.number().nonnegative().nullish(),
    bedrooms: z.number().int().nonnegative().nullish(),
    bathrooms: z.number().int().nonnegative().nullish(),
    floors: z.number().int().nonnegative().nullish(),
    views: z.string().max(500).nullish(),
    furnishing: z.string().max(200).nullish(),
    agents: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(120),
          title: z.enum(["Property Advisor", "Founder & CEO"]),
          image: z.string().max(2000).default(""),
        }),
      )
      .max(2)
      .default([]),
    subdistrict: z.string().default(""),
    district: z.string().min(1),
    province: z.string().default("Chiang Rai"),
    latitude: z.number().min(-90).max(90).nullish(),
    longitude: z.number().min(-180).max(180).nullish(),
    features: z.array(z.string()).default([]),
    images: z.array(z.string().max(2000)).max(40).default([]),
    floorPlanImage: z.string().nullish(),
    layout: z
      .array(
        z.object({
          name: z.string(),
          nameTh: z.string().optional(),
          sqm: z.number(),
        }),
      )
      .default([]),
    insiderTip: z.string().nullish(),
    advisory: z
      .array(z.object({ factor: z.string(), detail: z.string() }))
      .default([]),
    ownership: z.string().nullish(),
    featured: z.boolean().default(false),
  })
  .refine((value) => (value.latitude == null) === (value.longitude == null), {
    message: "Provide both latitude and longitude, or leave both empty.",
    path: ["latitude"],
  });

export const listings = {
  adminList: admin
    .input(
      z.object({
        q: z.string().optional(),
        publication: z.enum(["draft", "published"]).optional(),
        deal: z.enum(["sale", "rent", "stay"]).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const where: SQL[] = [];
      if (input.publication)
        where.push(eq(listingsTable.publication, input.publication));
      if (input.deal) where.push(eq(listingsTable.deal, input.deal));
      if (input.q)
        where.push(
          or(
            like(listingsTable.title, `%${input.q}%`),
            like(listingsTable.ref, `%${input.q}%`),
          )!,
        );
      return Promise.all(
        (
          await db
            .select()
            .from(listingsTable)
            .where(and(...where))
            .orderBy(desc(listingsTable.updatedAt))
        ).map((r) => present(r, true)),
      );
    }),
  nextRef: admin.handler(async () => {
    const rows = await db
      .select({ ref: listingsTable.ref })
      .from(listingsTable);
    const max = rows.reduce(
      (n, r) =>
        Math.max(n, /^CR-\d+$/.test(r.ref) ? Number(r.ref.slice(3)) : 0),
      0,
    );
    return { ref: `CR-${String(max + 1).padStart(3, "0")}` };
  }),
  list: base.input(filterInput).handler(async ({ input }) => {
    const where: SQL[] = [eq(listingsTable.publication, "published")];
    if (input.type) where.push(eq(listingsTable.type, input.type));
    if (input.deal) where.push(eq(listingsTable.deal, input.deal));
    if (input.district) where.push(eq(listingsTable.district, input.district));
    if (input.minPrice != null)
      where.push(gte(listingsTable.price, input.minPrice));
    if (input.maxPrice != null)
      where.push(lte(listingsTable.price, input.maxPrice));
    if (input.minPrice != null || input.maxPrice != null)
      where.push(ne(listingsTable.priceDisplay, "on-request"));
    if (input.minBeds != null)
      where.push(gte(listingsTable.bedrooms, input.minBeds));
    if (input.minSqm != null)
      where.push(gte(listingsTable.areaSqm, input.minSqm));
    if (input.featured) where.push(eq(listingsTable.featured, true));
    if (input.q) {
      const q = `%${input.q}%`;
      where.push(
        or(
          like(listingsTable.title, q),
          like(listingsTable.subdistrict, q),
          like(listingsTable.district, q),
          like(listingsTable.ref, q),
        )!,
      );
    }
    const order =
      input.sort === "price-asc"
        ? asc(
            sql`case when ${listingsTable.priceDisplay} = 'on-request' then null else ${listingsTable.price} end`,
          )
        : input.sort === "price-desc"
          ? desc(
              sql`case when ${listingsTable.priceDisplay} = 'on-request' then null else ${listingsTable.price} end`,
            )
          : input.sort === "size-desc"
            ? desc(
                sql`coalesce(${listingsTable.areaSqm}, ${listingsTable.landSqm})`,
              )
            : desc(listingsTable.createdAt);
    const rows = await db
      .select()
      .from(listingsTable)
      .where(where.length ? and(...where) : undefined)
      .orderBy(order, desc(listingsTable.id))
      .limit(input.limit);
    return Promise.all(rows.map((r) => present(r)));
  }),

  get: base
    .input(z.object({ id: z.number() }))
    .handler(async ({ input, context }) => {
      const [row] = await db
        .select()
        .from(listingsTable)
        .where(eq(listingsTable.id, input.id));
      if (!row)
        throw new ORPCError("NOT_FOUND", { message: "Listing not found" });
      if (
        row.publication !== "published" &&
        !(await auth.api.getSession({ headers: context.headers }))
      )
        throw new ORPCError("NOT_FOUND");
      const similarRows = await db
        .select()
        .from(listingsTable)
        .where(
          and(
            eq(listingsTable.publication, "published"),
            eq(listingsTable.type, row.type),
            ne(listingsTable.id, row.id),
          ),
        )
        .orderBy(desc(listingsTable.createdAt))
        .limit(3);
      return {
        listing: await present(row),
        similar: await Promise.all(similarRows.map((r) => present(r))),
      };
    }),

  meta: base.handler(async () => {
    const counts = await db
      .select({ type: listingsTable.type, n: sql<number>`count(*)` })
      .from(listingsTable)
      .where(eq(listingsTable.publication, "published"))
      .groupBy(listingsTable.type);
    const districts = await db
      .selectDistinct({ district: listingsTable.district })
      .from(listingsTable)
      .where(eq(listingsTable.publication, "published"))
      .orderBy(asc(listingsTable.district));
    return {
      counts: Object.fromEntries(
        counts.map((c) => [c.type, Number(c.n)]),
      ) as Record<string, number>,
      districts: districts.map((d) => d.district),
    };
  }),

  create: admin.input(listingInput).handler(async ({ input }) => {
    await validateAssignment(input.advisorIds);
    await uniqueRef(input.ref);
    const [row] = await db.insert(listingsTable).values(input).returning();
    return row!;
  }),

  update: admin
    .input(
      z.object({
        id: z.number(),
        revision: z.number().int(),
        data: listingInput,
      }),
    )
    .handler(async ({ input }) => {
      await validateAssignment(input.data.advisorIds);
      await uniqueRef(input.data.ref, input.id);
      const [row] = await db
        .update(listingsTable)
        .set({
          ...input.data,
          publication: "draft",
          brochureRef: null,
          publishedAt: null,
          revision: sql`${listingsTable.revision} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(listingsTable.id, input.id),
            eq(listingsTable.revision, input.revision),
          ),
        )
        .returning();
      if (!row)
        throw new ORPCError("CONFLICT", {
          message: "This listing changed in another tab. Reload before saving.",
        });
      return row!;
    }),

  remove: admin
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      await db.delete(listingsTable).where(eq(listingsTable.id, input.id));
      return { ok: true };
    }),

  raw: admin.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    const [row] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, input.id));
    if (!row) throw new ORPCError("NOT_FOUND");
    return present(row, true);
  }),
  publish: admin
    .input(z.object({ id: z.number(), revision: z.number().int() }))
    .handler(async ({ input }) => {
      const [row] = await db
        .select()
        .from(listingsTable)
        .where(eq(listingsTable.id, input.id));
      if (!row) throw new ORPCError("NOT_FOUND");
      if (row.revision !== input.revision)
        throw new ORPCError("CONFLICT", {
          message: "Reload this listing before publishing.",
        });
      if (!row.images.length || !row.summary.trim() || !row.description.trim())
        throw new ORPCError("BAD_REQUEST", {
          message:
            "Add a hero photo, short description and full description before publishing.",
        });
      if (row.priceDisplay !== "on-request" && row.price <= 0)
        throw new ORPCError("BAD_REQUEST", {
          message: "Enter a positive THB price or choose Price on request.",
        });
      await validateAssignment(row.advisorIds);
      let brochureRef: string;
      try {
        brochureRef = await publishBrochure({
          ...row,
          imageUrls: row.images,
          floorPlanUrl: row.floorPlanImage,
        });
      } catch (error) {
        throw new ORPCError("BAD_REQUEST", {
          message: `Publication failed; listing remains unchanged. ${error instanceof Error ? error.message : "Could not create brochure."}`,
        });
      }
      const [published] = await db
        .update(listingsTable)
        .set({
          publication: "published",
          publishedAt: new Date(),
          brochureRef,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(listingsTable.id, input.id),
            eq(listingsTable.revision, input.revision),
          ),
        )
        .returning();
      if (!published)
        throw new ORPCError("CONFLICT", {
          message:
            "Listing changed during brochure creation. Save and publish again.",
        });
      return published;
    }),
  unpublish: admin
    .input(z.object({ id: z.number(), revision: z.number().int() }))
    .handler(async ({ input }) => {
      const [row] = await db
        .update(listingsTable)
        .set({
          publication: "draft",
          brochureRef: null,
          publishedAt: null,
          revision: sql`${listingsTable.revision} + 1`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(listingsTable.id, input.id),
            eq(listingsTable.revision, input.revision),
          ),
        )
        .returning();
      if (!row)
        throw new ORPCError("CONFLICT", {
          message: "Reload the listing before withdrawing.",
        });
      return row;
    }),
};

async function uniqueRef(ref: string, id?: number) {
  const rows = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.ref, ref));
  if (rows.some((r) => r.id !== id))
    throw new ORPCError("CONFLICT", {
      message: "Reference already exists. Choose another code.",
    });
}
async function validateAssignment(ids: number[]) {
  if (new Set(ids).size !== ids.length)
    throw new ORPCError("BAD_REQUEST", {
      message: "Choose different primary and co-advisors.",
    });
  if (!ids.length) return;
  const rows = await db
    .select()
    .from(advisorsTable)
    .where(inArray(advisorsTable.id, ids));
  if (rows.length !== ids.length || rows.some((r) => !r.active))
    throw new ORPCError("BAD_REQUEST", {
      message: "Choose active advisors from the directory.",
    });
}
