import { db } from "../src/api/database";
import { sql } from "drizzle-orm";

// Additive, idempotent migration: never drop/rebuild existing listing data.
const columns = new Set((await db.all(sql`PRAGMA table_info(listings)`)).map((r) => r.name));
const additions = {
  publication: "TEXT NOT NULL DEFAULT 'draft'", revision: "INTEGER NOT NULL DEFAULT 1",
  published_at: "INTEGER", brochure_ref: "TEXT", price_display: "TEXT NOT NULL DEFAULT 'numeric'",
  negotiable: "INTEGER NOT NULL DEFAULT 0", advisor_ids: "TEXT NOT NULL DEFAULT '[]'",
};
for (const [name, definition] of Object.entries(additions)) if (!columns.has(name)) await db.run(sql.raw(`ALTER TABLE listings ADD COLUMN ${name} ${definition}`));
await db.run(sql`CREATE TABLE IF NOT EXISTS advisors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, title TEXT NOT NULL, image TEXT NOT NULL DEFAULT '', active INTEGER NOT NULL DEFAULT 1)`);
await db.run(sql`INSERT INTO advisors (name, title, image) SELECT 'Sai Chadathorn', 'Founder & CEO', '/images/founder.jpg' WHERE NOT EXISTS (SELECT 1 FROM advisors WHERE name = 'Sai Chadathorn')`);
console.log("CMS columns and advisor directory ready; existing listings preserved.");