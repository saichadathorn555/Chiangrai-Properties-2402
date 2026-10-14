import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import { inquiries as inquiriesTable } from "../database/schema";
import { notifyNewsletter } from "../services/newsletter-notification";

const consentText = "Yes, subscribe me to your newsletter. *";
const requests = new Map<string, { count: number; start: number }>();
const inFlight = new Map<string, Promise<{ ok: boolean }>>();

async function saveAndNotify(email: string, now: number) {
  const [existing] = await db.select().from(inquiriesTable)
    .where(and(eq(inquiriesTable.kind, "newsletter"), eq(inquiriesTable.email, email))).limit(1);
  // Same response for both cases; don't reveal existing subscribers.
  if (existing?.meta["Notification accepted at"]) return { ok: true };
  const subscriber = existing ?? (await db.insert(inquiriesTable).values({
    kind: "newsletter",
    name: "Newsletter subscriber",
    email,
    message: "Launch updates and newsletter subscription",
    meta: {
      "Newsletter consent": "Yes",
      "Consent wording": consentText,
      "Consent recorded at": new Date(now).toISOString(),
      "Source": "Coming Soon page",
      "Notification provider": "FormSubmit",
      "Notification status": "Pending",
    },
  }).returning())[0]!;
  let acceptedAt: string;
  try {
    ({ acceptedAt } = await notifyNewsletter(email, consentText, subscriber.meta["Consent recorded at"] ?? new Date(now).toISOString()));
  } catch {
    // Keep the saved subscription; a retry can reattempt the notification.
    await db.update(inquiriesTable).set({ meta: {
      ...subscriber.meta,
      "Notification provider": "FormSubmit",
      "Notification status": "Failed — retry required",
    } }).where(eq(inquiriesTable.id, subscriber.id));
    throw new ORPCError("SERVICE_UNAVAILABLE", { message: "Notification unavailable. Please try again in a moment." });
  }
  await db.update(inquiriesTable).set({ meta: {
    ...subscriber.meta,
    "Notification provider": "FormSubmit",
    "Notification status": "Accepted by provider (delivery not confirmed)",
    "Notification accepted at": acceptedAt,
  } }).where(eq(inquiriesTable.id, subscriber.id));
  return { ok: true };
}

export const newsletter = {
  subscribe: base.input(z.object({
    email: z.string().trim().email().max(254).transform((s) => s.toLowerCase()),
    consent: z.literal(true),
    website: z.string().max(200).default(""),
  })).handler(async ({ input, context }) => {
    // Bot honeypot: acknowledge without adding anything to the mailing list.
    if (input.website) return { ok: true };
    const now = Date.now();
    for (const [key, value] of requests) {
      if (now - value.start > 3_600_000) requests.delete(key);
    }
    const ip = (context.headers.get("x-forwarded-for") ?? context.headers.get("x-real-ip") ?? "local").split(",")[0]!.trim();
    const hit = requests.get(ip) ?? { count: 0, start: now };
    if (hit.count >= 20) throw new ORPCError("TOO_MANY_REQUESTS", { message: "Please try again later." });
    hit.count++;
    requests.set(ip, hit);
    // Coalesce repeated clicks in this server process. Database matching also
    // avoids duplicate notifications on subsequent requests after acceptance.
    const pending = inFlight.get(input.email);
    if (pending) return pending;
    const task = saveAndNotify(input.email, now);
    inFlight.set(input.email, task);
    try {
      return await task;
    } finally {
      inFlight.delete(input.email);
    }
  }),
};