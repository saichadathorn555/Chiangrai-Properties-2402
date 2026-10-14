import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { base } from "../__core/app";
import { admin } from "../middleware/auth";
import { db } from "../database";
import { inquiries as inquiriesTable, listings as listingsTable } from "../database/schema";
import { limitInquiryRequests, submitAndNotifyInquiry } from "../services/inquiry-submission";

export const inquiries = {
  submit: base
    .input(
      z.object({
        kind: z.enum(["listing", "contact", "list-property", "consultation", "service", "partner"]),
        name: z.string().trim().min(1).max(200),
        email: z.string().trim().email().max(254),
        phone: z.string().max(60).optional(),
        message: z.string().max(5000).default(""),
        listingId: z.number().optional(),
        meta: z.record(z.string().max(100).regex(/^(?!Notification|Submission ID)/), z.string().max(2000)).refine((meta) => Object.keys(meta).length <= 30).default({}),
        submissionId: z.string().uuid().optional(),
        website: z.string().max(200).default(""),
      }),
    )
    .handler(async ({ input, context }) => {
      if (input.website) return { id: 0 };
      limitInquiryRequests(context.headers);
      const { submissionId, website: _website, ...inquiry } = input;
      return submitAndNotifyInquiry(inquiry, submissionId ?? crypto.randomUUID());
    }),

  list: admin.handler(async () => {
    return db
      .select({
        inquiry: inquiriesTable,
        listingTitle: listingsTable.title,
        listingRef: listingsTable.ref,
      })
      .from(inquiriesTable)
      .leftJoin(listingsTable, eq(inquiriesTable.listingId, listingsTable.id))
      .orderBy(desc(inquiriesTable.createdAt));
  }),

  setStatus: admin
    .input(z.object({ id: z.number(), status: z.enum(["new", "contacted", "closed"]) }))
    .handler(async ({ input }) => {
      await db.update(inquiriesTable).set({ status: input.status }).where(eq(inquiriesTable.id, input.id));
      return { ok: true };
    }),

  remove: admin.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    await db.delete(inquiriesTable).where(eq(inquiriesTable.id, input.id));
    return { ok: true };
  }),
};
