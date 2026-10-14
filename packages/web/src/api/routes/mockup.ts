import { z } from "zod";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { generateText } from "ai";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { draft as base } from "../middleware/draft";
import { db } from "../database";
import { listings, mockups as mockupsTable } from "../database/schema";
import { gateway } from "../agent/gateway";
import { getObjectBytes, putObject, resolveMedia } from "../lib/s3";

export const STYLES = [
  "Minimal Japandi",
  "Warm Scandinavian",
  "Modern Lanna (Northern Thai)",
  "Tropical Resort",
  "Contemporary Luxury",
  "Industrial Loft",
  "Boutique Café / Retail",
  "Corporate Office",
] as const;

async function loadSource(ref: string) {
  if (ref.startsWith("s3:")) {
    const key = ref.slice(3);
    if (!/^(listings|customer-uploads)\//.test(key) || key.includes("..")) throw new ORPCError("BAD_REQUEST");
    return getObjectBytes(key);
  }
  if (!ref.startsWith("/images/") || ref.includes("..")) throw new ORPCError("BAD_REQUEST");
  const file = path.resolve(process.cwd(), "public", "." + ref);
  const bytes = new Uint8Array(await readFile(file));
  return { bytes, contentType: ref.endsWith(".png") ? "image/png" : "image/jpeg" };
}

/** Simple in-memory limiter so the public AI endpoint can't be hammered. */
const LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000;
const hits = new Map<string, number[]>();
function checkRate(headers: Headers) {
  const ip = (headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "local").split(",")[0]!.trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    throw new ORPCError("TOO_MANY_REQUESTS", { message: "You've reached the hourly limit for AI visuals. Please try again later." });
  }
  recent.push(now);
  hits.set(ip, recent);
}

export const mockup = {
  styles: base.handler(() => STYLES),

  generate: base
    .input(
      z.object({
        sourceRef: z.string().optional(),
        listingId: z.number().optional(),
        space: z.string().min(1).max(80),
        style: z.string().min(1).max(80),
        notes: z.string().max(600).default(""),
        mode: z.enum(["restyle", "imagine"]).default("restyle"),
      }),
    )
    .handler(async ({ input, context: ctx }) => {
      checkRate(ctx.headers);
      let context = "";
      if (input.listingId) {
        const [l] = await db.select().from(listings).where(eq(listings.id, input.listingId));
        if (l) context = `The property is a ${l.type} in ${l.district}, Chiang Rai${l.areaSqm ? `, about ${l.areaSqm} sqm` : ""}.`;
      }
      const brief = [
        `Space: ${input.space}. Design style: ${input.style}.`,
        context,
        input.notes ? `Client wishes: ${input.notes}.` : "",
        "Photorealistic interior/architectural visualisation, natural daylight, realistic materials and proportions, editorial real-estate photography, no text, no watermarks, no people.",
      ]
        .filter(Boolean)
        .join(" ");

      const content: Array<{ type: "text"; text: string } | { type: "file"; data: string; mediaType: string }> = [];
      if (input.mode === "restyle" && input.sourceRef) {
        const src = await loadSource(input.sourceRef);
        content.push({
          type: "file",
          data: `data:${src.contentType};base64,${Buffer.from(src.bytes).toString("base64")}`,
          mediaType: src.contentType,
        });
        content.push({
          type: "text",
          text: `Redesign this exact space. Keep the room's architecture, walls, windows, doors, ceiling height and camera angle the same; change furniture, finishes, lighting and decor. ${brief}`,
        });
      } else {
        content.push({ type: "text", text: `Generate an image of a newly designed space. ${brief}` });
      }

      const result = await generateText({
        model: gateway("google/gemini-3-pro-image"),
        providerOptions: { google: { responseModalities: ["TEXT", "IMAGE"] } },
        messages: [{ role: "user", content }],
      });
      const file = result.files?.find((f) => f.mediaType.startsWith("image/"));
      if (!file) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "The AI didn't return an image. Please try again." });

      const ext = file.mediaType.includes("png") ? "png" : "jpg";
      const key = `mockups/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      await putObject(key, file.uint8Array, file.mediaType);
      await db.insert(mockupsTable).values({
        listingId: input.listingId,
        sourceKey: input.sourceRef,
        resultKey: `s3:${key}`,
        space: input.space,
        style: input.style,
        prompt: brief,
      });
      return { url: (await resolveMedia(`s3:${key}`))!, sourceUrl: await resolveMedia(input.sourceRef) };
    }),
};
