import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { admin } from "../middleware/auth";
import { db } from "../database";
import { advisors as table } from "../database/schema";
import { resolveMedia } from "../lib/s3";

const data = z.object({
  name: z.string().trim().min(1).max(120),
  title: z.enum(["Property Advisor", "Founder & CEO"]),
  image: z.string().max(2000).default(""),
  active: z.boolean().default(true),
});
export const advisors = {
  list: admin.handler(async () =>
    Promise.all(
      (await db.select().from(table).orderBy(asc(table.name))).map(
        async (a) => ({ ...a, imageUrl: await resolveMedia(a.image) }),
      ),
    ),
  ),
  save: admin
    .input(z.object({ id: z.number().int().positive().optional(), data }))
    .handler(async ({ input }) => {
      const [row] = input.id
        ? await db
            .update(table)
            .set(input.data)
            .where(eq(table.id, input.id))
            .returning()
        : await db.insert(table).values(input.data).returning();
      if (!row) throw new ORPCError("NOT_FOUND");
      return row;
    }),
};
