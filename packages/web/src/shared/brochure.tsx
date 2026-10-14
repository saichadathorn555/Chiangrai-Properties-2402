import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Listing } from "../web/queries/listings";
import {
  propertyInformation,
  propertyPrice,
} from "../web/lib/property-summary";

Font.registerHyphenationCallback((word) => [word]);
const s = StyleSheet.create({
  page: {
    height: 841.89,
    padding: 28,
    paddingBottom: 60,
    fontFamily: "BrochureBody",
    fontSize: 9,
    color: "#2A2522",
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 84,
    borderBottom: "1 solid #E5DCD2",
    marginBottom: 14,
  },
  logo: { width: 74, height: 74, objectFit: "contain" },
  contact: { textAlign: "right", fontSize: 8, lineHeight: 1.4 },
  title: {
    fontFamily: "BrochureDisplay",
    fontSize: 23,
    marginBottom: 12,
    textAlign: "center",
  },
  subhead: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summary: {
    backgroundColor: "#FBF8F4",
    padding: 10,
    border: "1 solid #E5DCD2",
    marginBottom: 14,
    fontSize: 9,
  },
  table: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18 },
  row: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 5,
    borderBottom: "1 solid #E5DCD2",
  },
  label: { width: "45%", color: "#7D736B", paddingRight: 5 },
  value: { width: "55%", paddingRight: 8 },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 28,
    right: 28,
    borderTop: "1 solid #E5DCD2",
    paddingTop: 7,
  },
  reference: { textAlign: "right", fontSize: 8, marginBottom: 5 },
  disclaimer: { fontSize: 6, color: "#7D736B", lineHeight: 1.4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  cell: {
    width: 263,
    height: 175,
    backgroundColor: "#FBF8F4",
    border: "1 solid #E5DCD2",
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%", objectFit: "contain" },
  empty: { color: "#7D736B", fontSize: 9, textAlign: "center" },
  watermark: {
    color: "#B88B6E",
    fontSize: 8,
    marginBottom: 8,
    textAlign: "center",
  },
});

export type BrochureMedia = {
  logo: string;
  photos: (string | null)[];
  plan: string | null;
};
export type BrochureListing = Pick<
  Listing,
  | "ref"
  | "title"
  | "description"
  | "summary"
  | "deal"
  | "province"
  | "price"
  | "priceDisplay"
  | "negotiable"
  | "type"
  | "district"
  | "areaSqm"
  | "landSqm"
  | "bedrooms"
  | "bathrooms"
  | "views"
  | "furnishing"
  | "imageUrls"
  | "floorPlanUrl"
>;
export function validateBrochure(l: BrochureListing) {
  if (
    l.description.length > 3800 ||
    l.summary.length > 700 ||
    l.title.length > 160
  )
    throw new Error(
      "Text exceeds the four-page brochure template. Shorten the description/summary/title before publishing.",
    );
}
export function Brochure({
  l,
  media,
  sample,
}: {
  l: BrochureListing;
  media: BrochureMedia;
  sample: boolean;
}) {
  const description =
    l.description ||
    "Description not yet provided. Please contact your advisor.";
  const bodySize =
    description.length > 2700 ? 8 : description.length > 1900 ? 9 : 10;
  const headingStyle = /[฀-๿]/.test(l.title)
    ? { ...s.title, fontFamily: "BrochureBody", fontSize: 18 }
    : s.title;
  const header = (
    <>
      <View style={s.header}>
        <Image src={media.logo} style={s.logo} />
        <View style={s.contact}>
          <Text style={{ fontSize: 12, marginBottom: 3 }}>
            Chiangrai Properties
          </Text>
          <Text>Chiang Rai, Thailand</Text>
          <Text>Email: contact@chiangrai-properties.com</Text>
          <Text>Web: www.chiangrai-properties.com</Text>
        </View>
      </View>
      <Text style={headingStyle}>{l.title}</Text>
      {sample && (
        <Text style={s.watermark}>
          PREVIEW SAMPLE — illustrative only. Not an available property.
        </Text>
      )}
    </>
  );
  const footer = (page: number) => (
    <View fixed wrap={false} style={s.footer}>
      <Text style={s.reference}>
        Ref: {l.ref} | {page} / 4
      </Text>
      <Text style={s.disclaimer}>
        For information only; not an offer or contract. Areas and distances are
        approximate. Descriptions, photographs and plans are indicative.
        Availability and pricing may change without notice. Confirm all details
        with your advisor.
      </Text>
    </View>
  );
  return (
    <Document
      title={`${l.ref} — ${l.title}`}
      author="Chiangrai Properties"
      subject="Property brochure"
      onRender={(result) => {
        const layout = (
          result as unknown as {
            _INTERNAL__LAYOUT__DATA_?: { children: unknown[] };
          }
        )._INTERNAL__LAYOUT__DATA_;
        if (layout && layout.children.length !== 4)
          throw new Error(
            "This property's description exceeds the four-page layout. Please request a complete brochure from the advisor.",
          );
      }}
    >
      <Page size="A4" style={s.page}>
        {header}
        <View style={s.subhead}>
          <Text>
            {l.deal === "sale"
              ? "For sale"
              : l.deal === "stay"
                ? "Stay"
                : "For rent"}{" "}
            · {l.province}
          </Text>
          <Text>{propertyPrice(l)}</Text>
        </View>
        {l.summary && <Text style={s.summary}>{l.summary}</Text>}
        <View style={s.table}>
          {propertyInformation(l).map(([label, value]) => (
            <View key={label} style={s.row}>
              <Text style={s.label}>{label}</Text>
              <Text style={s.value}>{value}</Text>
            </View>
          ))}
        </View>
        <Text style={{ fontSize: 8, color: "#7D736B", marginBottom: 10 }}>
          PROPERTY DETAILS
        </Text>
        {description
          .split(/\n\s*\n/)
          .filter(Boolean)
          .map((paragraph, i) => (
            <Text
              key={i}
              style={{ fontSize: bodySize, lineHeight: 1.45, marginBottom: 8 }}
            >
              {paragraph.replace(/^## /, "")}
            </Text>
          ))}
        {footer(1)}
      </Page>
      {[0, 6].map((offset, page) => (
        <Page key={offset} size="A4" style={s.page}>
          {header}
          <View style={s.grid}>
            {Array.from({ length: 6 }, (_, i) => (
              <View key={i} style={s.cell}>
                {media.photos[offset + i] ? (
                  <Image src={media.photos[offset + i]!} style={s.image} />
                ) : (
                  <Text style={s.empty}>
                    {offset + i < l.imageUrls.length
                      ? "Photograph could not be loaded"
                      : "No additional photograph supplied"}
                  </Text>
                )}
              </View>
            ))}
          </View>
          {l.imageUrls.length > 12 && page === 1 && (
            <Text style={{ fontSize: 7, marginTop: 8 }}>
              A selection of 12 photographs. View the complete gallery on the
              property page.
            </Text>
          )}
          {footer(page + 2)}
        </Page>
      ))}
      <Page size="A4" style={s.page}>
        {header}
        <Text style={{ fontSize: 9, letterSpacing: 2, marginBottom: 15 }}>
          FLOORPLAN
        </Text>
        <View
          style={{
            height: 520,
            backgroundColor: "#FBF8F4",
            border: "1 solid #E5DCD2",
            padding: 15,
            justifyContent: "center",
          }}
        >
          {media.plan ? (
            <Image src={media.plan} style={s.image} />
          ) : (
            <Text style={s.empty}>
              {l.floorPlanUrl
                ? "Floorplan could not be loaded. Please request a copy from your advisor."
                : "Floorplan not yet supplied. Please contact your advisor for details."}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 7, color: "#7D736B", marginTop: 10 }}>
          Layout shown for reference only. Not to scale unless stated on the
          supplied plan.
        </Text>
        {footer(4)}
      </Page>
    </Document>
  );
}
