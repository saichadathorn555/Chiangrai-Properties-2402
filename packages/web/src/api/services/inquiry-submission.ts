import { and, eq, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { db } from "../database";
import { inquiries } from "../database/schema";
import { notifyInquiry, type InquiryNotification } from "./inquiry-notification";

const pending = new Map<string, Promise<{ id: number }>>();
const hits = new Map<string, { start: number; count: number }>();

export function limitInquiryRequests(headers: Headers) {
  const now = Date.now();
  for (const [ip, hit] of hits) if (now - hit.start > 3_600_000) hits.delete(ip);
  const ip = (headers.get("x-forwarded-for") ?? headers.get("x-real-ip") ?? "local").split(",")[0]!.trim();
  const hit = hits.get(ip) ?? { start: now, count: 0 };
  if (hit.count >= 20) throw new ORPCError("TOO_MANY_REQUESTS", { message: "Please try again later." });
  hit.count++;
  hits.set(ip, hit);
}

async function saveAndNotify(input: InquiryNotification, submissionId: string) {
  const [existing] = await db.select().from(inquiries).where(and(
    eq(inquiries.email, input.email),
    sql`json_extract(${inquiries.meta}, '$."Submission ID"') = ${submissionId}`,
  )).limit(1);
  if (existing?.meta["Notification accepted at"]) return { id: existing.id };
  const meta = { ...input.meta, "Submission ID": submissionId, "Notification provider": "FormSubmit", "Notification status": "Pending" };
  const saved = existing ?? (await db.insert(inquiries).values({ ...input, meta }).returning())[0]!;
  // A failed retry may contain corrected data: retain and forward the newest fields.
  if (existing) await db.update(inquiries).set({ ...input, meta }).where(eq(inquiries.id, saved.id));
  let acceptedAt: string;
  try {
    ({ acceptedAt } = await notifyInquiry(input));
  } catch {
    await db.update(inquiries).set({ meta: { ...meta, "Notification status": "Failed — retry required" } }).where(eq(inquiries.id, saved.id));
    throw new ORPCError("SERVICE_UNAVAILABLE", { message: "We could not forward your enquiry. Please try again, or email contact@chiangrai-properties.com." });
  }
  await db.update(inquiries).set({ meta: { ...meta, "Notification status": "Accepted by provider (delivery not confirmed)", "Notification accepted at": acceptedAt } }).where(eq(inquiries.id, saved.id));
  return { id: saved.id };
}

export async function submitAndNotifyInquiry(input: InquiryNotification, submissionId: string) {
  const key = `${input.email}:${submissionId}`;
  const existing = pending.get(key);
  if (existing) return existing;
  const task = saveAndNotify(input, submissionId);
  pending.set(key, task);
  try { return await task; } finally { pending.delete(key); }
}