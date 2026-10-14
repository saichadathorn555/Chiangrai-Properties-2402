import type { Listing } from "../queries/listings";

export const propertyPrice = (l: Pick<Listing, "price" | "deal" | "priceDisplay" | "negotiable">) => {
  if (l.priceDisplay === "on-request" || l.price == null) return `Price on request${l.negotiable ? " · Negotiable" : ""}`;
  return `${l.priceDisplay === "starting-from" ? "Starting from " : ""}${l.price.toLocaleString("en-US")} THB${l.deal === "rent" ? " / month" : l.deal === "stay" ? " / night" : ""}${l.negotiable ? " · Negotiable" : ""}`;
};
export function propertyInformation(l: Pick<Listing, "ref" | "type" | "district" | "province" | "areaSqm" | "landSqm" | "bedrooms" | "bathrooms" | "views" | "furnishing">): [string, string][] {
  const number = (n: number | null | undefined) => n == null ? "Not provided" : n.toLocaleString("en-US");
  return [
    ["Property reference", l.ref], ["Property type", l.type.charAt(0).toUpperCase() + l.type.slice(1)],
    ["District / City", [l.district, l.province].filter(Boolean).join(", ")],
    ["Living area", l.areaSqm == null ? "Not provided" : `${number(l.areaSqm)} sqm`],
    ["Plot area", l.landSqm == null ? "Not provided" : `${number(l.landSqm)} sqm / ${number(l.landSqm / 1600)} Rai`],
    ["Bedrooms", number(l.bedrooms)], ["Bathrooms", number(l.bathrooms)],
    ["Views", l.views || "Not provided"], ["Furnishing status", l.furnishing || "Not provided"],
  ];
}
export function propertyAdvisors(l: Listing) {
  return l.advisorProfiles?.length ? l.advisorProfiles : [{ name: "Sai Chadathorn", title: "Founder & CEO", imageUrl: "/images/founder.jpg" }];
}