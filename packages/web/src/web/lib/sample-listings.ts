import type { Listing, ListingFilters } from "../queries/listings";

// Preview fixtures only: never written to the database or offered as real stock.
export const sampleListings: Listing[] = (["sale", "rent", "stay"] as const).flatMap((deal, d) =>
  (["house", "condo", "land", "retail", "commercial", "apartment"] as const).map((type, i) => ({
    id: -(d * 6 + i + 1), ref: `SAMPLE-${deal}-${type}`, type, deal, status: "available" as const,
    publication: "draft", revision: 1, publishedAt: null, brochureRef: null, brochureUrl: null, priceDisplay: "numeric", negotiable: false, advisorIds: [],
    title: `Sample ${type === "house" ? "home" : type} in Chiang Rai`, titleTh: null,
    summary: "Preview sample only — not an available property.", summaryTh: null,
    description: "This sample demonstrates the property layout, specifications, district map and floor plan viewer. Images, areas and prices are illustrative only. No booking or enquiry is accepted for sample properties.", descriptionTh: null,
    price: deal === "sale" ? 3500000 + i * 500000 : 18000 + i * 3000,
    areaSqm: type === "land" ? null : type === "condo" ? 68 : 180,
    landSqm: type === "condo" || type === "apartment" ? null : type === "land" ? 1600 : 400,
    bedrooms: type === "house" ? 3 : type === "condo" || type === "apartment" ? 2 : null,
    bathrooms: type === "land" ? null : 2, floors: 1, views: null, furnishing: null, agents: [], advisorProfiles: [],
    subdistrict: "", district: "Mueang Chiang Rai", province: "Chiang Rai", latitude: null, longitude: null,
    features: ["Illustrative preview"], images: [`/images/${type}-1.jpg`], imageUrls: [`/images/${type}-1.jpg`], imageRefs: [`/images/${type}-1.jpg`],
    floorPlanImage: type === "land" ? null : `/images/plan-${type === "condo" || type === "apartment" ? "condo" : type === "house" ? "house" : "retail"}.jpg`,
    floorPlanUrl: type === "land" ? null : `/images/plan-${type === "condo" || type === "apartment" ? "condo" : type === "house" ? "house" : "retail"}.jpg`,
    layout: [], insiderTip: null, advisory: [], ownership: "Preview sample — not a real listing.", featured: false,
    createdAt: new Date("2026-10-01"), updatedAt: new Date("2026-10-01"),
  })));

export function filteredSamples(filters: ListingFilters) {
  return sampleListings.filter((l) => (!filters.deal || l.deal === filters.deal) && (!filters.type || l.type === filters.type)
    && (!filters.district || l.district === filters.district) && (filters.minPrice == null || (l.price ?? 0) >= filters.minPrice)
    && (filters.maxPrice == null || (l.price ?? 0) <= filters.maxPrice) && (filters.minBeds == null || (l.bedrooms ?? 0) >= filters.minBeds)
    && (filters.minSqm == null || (l.areaSqm ?? l.landSqm ?? 0) >= filters.minSqm)
    && (!filters.q || l.title.toLowerCase().includes(filters.q.toLowerCase()))).slice(0, filters.limit ?? 60);
}