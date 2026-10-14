import { count } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import { user } from "../database/schema";

/** Tells the admin UI whether the owner account has been created yet. */
export const setup = base.handler(async () => {
  const [row] = await db.select({ n: count() }).from(user);
  return { hasAdmin: (row?.n ?? 0) > 0 };
});
