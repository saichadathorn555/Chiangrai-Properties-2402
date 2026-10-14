import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export * from "./auth-schema";

export type LayoutRoom = { name: string; nameTh?: string; sqm: number };
export type AdvisoryRow = { factor: string; detail: string };
export type PropertyAdvisor = { name: string; title: "Property Advisor" | "Founder & CEO"; image: string };

export const advisors = sqliteTable("advisors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  title: text("title", { enum: ["Property Advisor", "Founder & CEO"] }).notNull(),
  image: text("image").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const listings = sqliteTable("listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ref: text("ref").notNull().unique(),
  type: text("type", {
    enum: ["house", "apartment", "condo", "retail", "commercial", "land"],
  }).notNull(),
  deal: text("deal", { enum: ["sale", "rent", "stay"] }).notNull(),
  publication: text("publication", { enum: ["draft", "published"] }).notNull().default("draft"),
  revision: integer("revision").notNull().default(1),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  brochureRef: text("brochure_ref"),
  priceDisplay: text("price_display", { enum: ["numeric", "on-request", "starting-from"] }).notNull().default("numeric"),
  negotiable: integer("negotiable", { mode: "boolean" }).notNull().default(false),
  advisorIds: text("advisor_ids", { mode: "json" }).$type<number[]>().notNull().default([]),
  status: text("status", { enum: ["available", "reserved", "sold", "rented"] })
    .notNull()
    .default("available"),
  title: text("title").notNull(),
  titleTh: text("title_th"),
  summary: text("summary").notNull().default(""),
  summaryTh: text("summary_th"),
  description: text("description").notNull().default(""),
  descriptionTh: text("description_th"),
  price: integer("price").notNull(),
  areaSqm: real("area_sqm"),
  landSqm: real("land_sqm"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  floors: integer("floors"),
  views: text("views"),
  furnishing: text("furnishing"),
  agents: text("agents", { mode: "json" }).$type<PropertyAdvisor[]>().notNull().default([]),
  subdistrict: text("subdistrict").notNull().default(""),
  district: text("district").notNull(),
  province: text("province").notNull().default("Chiang Rai"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  features: text("features", { mode: "json" }).$type<string[]>().notNull().default([]),
  images: text("images", { mode: "json" }).$type<string[]>().notNull().default([]),
  floorPlanImage: text("floor_plan_image"),
  layout: text("layout", { mode: "json" }).$type<LayoutRoom[]>().notNull().default([]),
  insiderTip: text("insider_tip"),
  advisory: text("advisory", { mode: "json" }).$type<AdvisoryRow[]>().notNull().default([]),
  ownership: text("ownership"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["listing", "contact", "list-property", "consultation", "service", "partner", "newsletter"] }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull().default(""),
  listingId: integer("listing_id"),
  meta: text("meta", { mode: "json" }).$type<Record<string, string>>().notNull().default({}),
  status: text("status", { enum: ["new", "contacted", "closed"] }).notNull().default("new"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const mockups = sqliteTable("mockups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id"),
  sourceKey: text("source_key"),
  resultKey: text("result_key").notNull(),
  space: text("space").notNull(),
  style: text("style").notNull(),
  prompt: text("prompt").notNull().default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
