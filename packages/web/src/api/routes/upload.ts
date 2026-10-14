import { z } from "zod";
import { draft as base } from "../middleware/draft";
import { admin } from "../middleware/auth";
import { presignPut, resolveMedia } from "../lib/s3";

const fileInput = z.object({
  filename: z.string().max(200),
  contentType: z.string().regex(/^image\/(png|jpe?g|webp)$/),
});

function safe(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export const upload = {
  /** Customer upload for the AI visualiser. */
  presignCustomer: base.input(fileInput).handler(async ({ input }) => {
    const key = `customer-uploads/${Date.now()}-${safe(input.filename)}`;
    return { url: await presignPut(key, input.contentType), ref: `s3:${key}` };
  }),
  /** Admin upload for listing photos and floor plans. */
  presignListing: admin.input(fileInput).handler(async ({ input }) => {
    const key = `listings/${Date.now()}-${safe(input.filename)}`;
    return { url: await presignPut(key, input.contentType), ref: `s3:${key}` };
  }),
  resolve: base.input(z.object({ ref: z.string() })).handler(async ({ input }) => ({
    url: await resolveMedia(input.ref),
  })),
};
