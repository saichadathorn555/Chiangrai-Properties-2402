import { Link } from "wouter";
import { BedDouble, Bath, SquareArrowOutUpRight, LandPlot, MapPin, type LucideIcon } from "lucide-react";
import { useT } from "../../i18n/context";
import { fmtNum } from "../../lib/format";
import { propertyPrice } from "../../lib/property-summary";
import type { Listing } from "../../queries/listings";

export function pickLang<T extends string | null | undefined>(en: string, th: T, lang: string) {
  return lang === "th" && th ? th : en;
}

export function Specs({ l, className = "" }: { l: Listing; className?: string }) {
  const { lang } = useT();
  const items: { text: string; icon: LucideIcon }[] = [];
  if (l.bedrooms != null) items.push({ text: `${l.bedrooms} ${lang === "th" ? "ห้องนอน" : "Bedrooms"}`, icon: BedDouble });
  if (l.bathrooms != null) items.push({ text: `${l.bathrooms} ${lang === "th" ? "ห้องน้ำ" : "Bathrooms"}`, icon: Bath });
  if (l.areaSqm != null) items.push({ text: `~${fmtNum(l.areaSqm, lang)} m² ${lang === "th" ? "พื้นที่ใช้สอย" : "Living area"}`, icon: SquareArrowOutUpRight });
  if (l.landSqm != null) items.push({ text: l.type === "land"
    ? `~${fmtNum(l.landSqm / 4, lang)} ตารางวา ${lang === "th" ? "พื้นที่ดิน" : "Plot surface"}`
    : `~${fmtNum(l.landSqm, lang)} m² ${lang === "th" ? "พื้นที่ดิน" : "Plot surface"}`, icon: LandPlot });
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 text-[13px] text-stone ${className}`}>
      {items.map(({ text, icon: Icon }) => (
        <span key={text} className="inline-flex items-center gap-2">
          <Icon aria-hidden="true" className="size-[18px] shrink-0 text-stone" strokeWidth={1.25} />
          {text}
        </span>
      ))}
    </div>
  );
}

export function PriceTag({ l, className = "" }: { l: Listing; className?: string }) {
  return (
    <span className={className}>
      {propertyPrice(l)}
    </span>
  );
}

export function ListingCard({ l, delay = "", transaction }: { l: Listing; delay?: string; transaction?: "stay" }) {
  const { t, lang } = useT();
  return (
    <Link to={`/property/${l.id}`} className={`group block reveal ${delay}`}>
      <div className="img-zoom relative aspect-[4/3] overflow-hidden bg-nude">
        {l.imageUrls[0] && (
          <img src={l.imageUrls[0]} alt={l.title} loading="lazy" className="size-full object-cover" />
        )}
        <span className="eyebrow absolute top-4 left-4 bg-paper/90 px-3 py-1.5 text-[10px]">
          {transaction === "stay" ? "Stay" : t.deal[l.deal]}
        </span>
        {l.id < 0 && <span className="absolute right-3 bottom-3 bg-paper/95 px-2 py-1 text-[10px] tracking-wider text-stone">PREVIEW SAMPLE</span>}
        {l.status !== "available" && (
          <span className="eyebrow absolute top-4 right-4 bg-ink px-3 py-1.5 text-[10px] text-paper">
            {t.status[l.status]}
          </span>
        )}
      </div>
      <div className="pt-5">
        <div className="eyebrow flex justify-between text-stone">
          <span>{t.types[l.type]}</span>
        </div>
        <h3 className="mt-3 font-serif text-[24px] leading-[1.15] font-normal transition-colors group-hover:text-clay">
          {pickLang(l.title, l.titleTh, lang)}
        </h3>
        <p className="mt-3 flex items-start gap-2 text-[13px] text-stone"><MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.25} />{[l.subdistrict, l.district, l.province].filter(Boolean).join(", ")}</p>
        <div className="mt-4 border-t border-line pt-4">
          <Specs l={l} />
          <PriceTag l={l} className="mt-5 block font-medium" />
        </div>
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-nude" />
      <div className="mt-5 h-3 w-1/3 bg-nude" />
      <div className="mt-4 h-6 w-4/5 bg-nude" />
      <div className="mt-5 h-3 w-full bg-nude" />
    </div>
  );
}
