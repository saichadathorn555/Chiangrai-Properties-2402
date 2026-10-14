import { useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { SlidersHorizontal } from "lucide-react";
import { useT } from "../i18n/context";
import { TYPE_KEYS, type TypeKey } from "../i18n/dict";
import { useListings, useListingsMeta, type ListingFilters } from "../queries/listings";
import { CardSkeleton, ListingCard } from "../components/site/listing-card";

const SALE_PRICES = [2_000_000, 3_000_000, 5_000_000, 8_000_000, 10_000_000, 20_000_000, 50_000_000];
const RENT_PRICES = [5_000, 10_000, 20_000, 30_000, 50_000, 100_000, 200_000];

export default function PropertiesPage() {
  const { t } = useT();
  const search = useSearch();
  const [, nav] = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const meta = useListingsMeta();

  const filters: ListingFilters = {
    type: (params.get("type") as TypeKey) || undefined,
    deal: (params.get("deal") as "sale" | "rent" | "stay") || undefined,
    district: params.get("district") || undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    minBeds: params.get("minBeds") ? Number(params.get("minBeds")) : undefined,
    minSqm: params.get("minSqm") ? Number(params.get("minSqm")) : undefined,
    q: params.get("q") || undefined,
    sort: (params.get("sort") as ListingFilters["sort"]) || "newest",
    limit: 60,
  };
  const listings = useListings(filters);

  function set(key: string, value: string) {
    const p = new URLSearchParams(search);
    if (value) p.set(key, value);
    else p.delete(key);
    nav(`/properties${p.size ? `?${p}` : ""}`, { replace: true });
  }

  const prices = filters.deal === "rent" || filters.deal === "stay" ? RENT_PRICES : SALE_PRICES;
  const showBeds = !filters.type || ["house", "apartment", "condo"].includes(filters.type);
  const heading = filters.type ? t.typesPlural[filters.type] : t.filters.title;

  return (
    <div className="wrap pt-14">
      <p className="eyebrow reveal d1 text-stone">
        {filters.deal ? t.deal[filters.deal] : t.filters.allDeals} · Chiang Rai
      </p>
      <h1 className="display translated-heading reveal d2 mt-4 [--heading-size:52px] md:[--heading-size:84px]">{heading}</h1>

      {/* type chips */}
      <div className="reveal d3 mt-10 flex flex-wrap gap-2 border-b border-line pb-6">
        <button
          onClick={() => set("type", "")}
          className={`eyebrow border px-4 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze ${!filters.type ? "border-bronze bg-bronze text-ink" : "border-line hover:border-bronze"}`}
        >
          {t.filters.all}
        </button>
        {TYPE_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => set("type", k)}
            className={`eyebrow border px-4 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze ${filters.type === k ? "border-bronze bg-bronze text-ink" : "border-line hover:border-bronze"}`}
          >
            {t.types[k]}
          </button>
        ))}
      </div>

      {/* filters */}
      <div className="reveal d4 grid grid-cols-2 gap-4 py-6 md:grid-cols-4 lg:grid-cols-8">
        <div className="col-span-2 flex items-center gap-2 text-stone md:col-span-4 lg:col-span-8">
          <SlidersHorizontal className="size-4" strokeWidth={1.25} />
          <span className="eyebrow">Filters</span>
        </div>
        <select value={filters.deal ?? ""} onChange={(e) => set("deal", e.target.value)} className="field">
          <option value="">{t.filters.allDeals}</option>
          <option value="sale">{t.deal.sale}</option>
          <option value="rent">{t.deal.rent}</option>
          <option value="stay">{t.deal.stay}</option>
        </select>
        <select value={filters.district ?? ""} onChange={(e) => set("district", e.target.value)} className="field">
          <option value="">{t.filters.allDistricts}</option>
          {meta.data?.districts.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={filters.minPrice ?? ""} onChange={(e) => set("minPrice", e.target.value)} className="field">
          <option value="">{t.filters.minPrice}</option>
          {prices.map((p) => <option key={p} value={p}>฿{p.toLocaleString()}</option>)}
        </select>
        <select value={filters.maxPrice ?? ""} onChange={(e) => set("maxPrice", e.target.value)} className="field">
          <option value="">{t.filters.maxPrice}</option>
          {prices.map((p) => <option key={p} value={p}>฿{p.toLocaleString()}</option>)}
        </select>
        {showBeds ? (
          <select value={filters.minBeds ?? ""} onChange={(e) => set("minBeds", e.target.value)} className="field">
            <option value="">{t.filters.minBeds}</option>
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}+</option>)}
          </select>
        ) : (
          <div className="hidden lg:block" />
        )}
        <select value={filters.minSqm ?? ""} onChange={(e) => set("minSqm", e.target.value)} className="field">
          <option value="">{t.filters.minSqm}</option>
          {[30, 50, 100, 200, 300, 500, 1000].map((n) => <option key={n} value={n}>{n}+ {t.sqm}</option>)}
        </select>
        <input
          defaultValue={filters.q ?? ""}
          placeholder={t.filters.keyword}
          aria-label={t.filters.keyword}
          onKeyDown={(e) => e.key === "Enter" && set("q", (e.target as HTMLInputElement).value)}
          onBlur={(e) => e.target.value !== (filters.q ?? "") && set("q", e.target.value)}
          className="field"
        />
        <select value={filters.sort} onChange={(e) => set("sort", e.target.value)} className="field">
          <option value="newest">{t.filters.newest}</option>
          <option value="price-asc">{t.filters.priceAsc}</option>
          <option value="price-desc">{t.filters.priceDesc}</option>
          <option value="size-desc">{t.filters.sizeDesc}</option>
        </select>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-5 text-[13px] text-stone">
        <span>
          {listings.isLoading ? "…" : listings.data?.length ?? 0} {t.filters.results}
        </span>
        {search && (
          <button onClick={() => nav("/properties")} className="btn-ghost py-0 text-[11px]">
            {t.filters.reset}
          </button>
        )}
      </div>

      <div className="grid gap-x-8 gap-y-16 pt-10 md:grid-cols-2 lg:grid-cols-3">
        {listings.isLoading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        {listings.data?.map((l, i) => <ListingCard key={l.id} l={l} delay={`d${(i % 3) + 1}`} />)}
      </div>
      {listings.data && listings.data.length === 0 && (
        <div className="mx-auto max-w-xl py-24 text-center">
          <p className="font-serif text-[26px]">{t.filters.none}</p>
        </div>
      )}
    </div>
  );
}
