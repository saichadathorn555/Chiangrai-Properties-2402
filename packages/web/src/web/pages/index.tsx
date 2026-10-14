import { useState } from "react";
import { Link } from "wouter";
import { Plus, Minus } from "lucide-react";
import { HomeFilters, type HomeSelection } from "../components/site/home-filters";
import { FounderPortrait } from "../components/site/founder-portrait";
import { useT } from "../i18n/context";
import { TYPE_KEYS, type TypeKey } from "../i18n/dict";
import { useListings, useListingsMeta } from "../queries/listings";
import { CardSkeleton, ListingCard } from "../components/site/listing-card";

const SEGMENT_IMG: Record<TypeKey, string> = {
  house: "/images/house-1.jpg",
  apartment: "/images/apartment-1.jpg",
  condo: "/images/condo-1.jpg",
  retail: "/images/retail-1.jpg",
  commercial: "/images/commercial-1.jpg",
  land: "/images/land-1.jpg",
};

function Faq() {
  const { t } = useT();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line border-y border-line">
      {t.faqs.map((f, i) => (
        <div key={f.q}>
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
            <span className="font-serif text-[22px] md:text-[26px]">{f.q}</span>
            {open === i ? <Minus className="size-4 shrink-0" strokeWidth={1.25} /> : <Plus className="size-4 shrink-0" strokeWidth={1.25} />}
          </button>
          {open === i && <p className="max-w-3xl pb-7 text-stone">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

export default function Index() {
  const { t } = useT();
  const [selection, setSelection] = useState<HomeSelection>({ transaction: "buy" });
  const deal = selection.transaction === "buy" ? "sale" : selection.transaction;
  const latest = useListings({ limit: 60, sort: "newest", deal, type: selection.type });
  const matches = selection.transaction === "stay" ? latest.data?.filter((l) => l.type === "house" || l.type === "condo") : latest.data;
  const shown = matches;
  const resultsLink = `/properties?deal=${deal}${selection.type ? `&type=${selection.type}` : ""}`;
  const meta = useListingsMeta();

  return (
    <>
      {/* HERO — compact introduction, transaction-first hierarchy */}
      <section className="wrap relative z-20 pt-8 md:pt-12">
        <p className="eyebrow reveal d1 text-center text-[10px] text-stone">{t.home.eyebrow}</p>
        <h1 className="display translated-heading reveal d2 mx-auto mt-3.5 max-w-3xl text-center [--heading-size:20px] leading-[1.15]! md:[--heading-size:38px]">
          {t.home.title1}
          {" "}
          <em className="font-light italic text-clay">{t.home.title2}</em>
        </h1>
        <p className="reveal d3 mx-auto mt-4 max-w-2xl text-center text-[14px] leading-[1.45] text-stone">{t.home.intro}</p>
        <div className="mx-auto mt-6 max-w-4xl md:mt-8">
          <HomeFilters selection={selection} onChange={setSelection} />
        </div>
      </section>
      <section className="wrap mt-10 md:mt-12">
        <div className="reveal d5 aspect-[16/8] overflow-hidden bg-nude md:aspect-[16/7]">
          <img src="/images/hero.jpg" alt="Modern home in the hills of Chiang Rai" className="size-full object-cover" />
        </div>
      </section>

      {/* SEGMENTS */}
      <section className="wrap mt-28 md:mt-36">
        <div className="flex items-end justify-between border-b border-line pb-6">
          <h2 className="display translated-heading [--heading-size:40px] md:[--heading-size:56px]">{t.home.segments}</h2>
          <Link to="/properties" className="btn-ghost hidden md:inline-flex">{t.viewAll}</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-10 md:grid-cols-3 lg:grid-cols-6">
          {TYPE_KEYS.map((k) => (
            <Link key={k} to={`/properties?type=${k}`} className="group block">
              <div className="img-zoom aspect-[3/4] overflow-hidden bg-nude">
                <img src={SEGMENT_IMG[k]} alt={t.types[k]} loading="lazy" className="size-full object-cover" />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-serif text-[22px] group-hover:text-clay">{t.typesPlural[k]}</span>
                <span className="text-[12px] text-stone">{meta.data?.counts[k] ?? 0}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW LISTINGS */}
      <section className="wrap mt-28 md:mt-36" aria-label="Filtered properties">
        <div className="flex items-end justify-between border-b border-line pb-6">
          <div>
            <p className="eyebrow text-stone">{t.home.newListingsSub}</p>
            <h2 className="display translated-heading mt-3 [--heading-size:40px] md:[--heading-size:56px]">{t.home.newListings}</h2>
          </div>
          <Link to={resultsLink} className="btn-ghost hidden md:inline-flex">{t.viewAll}</Link>
        </div>
        <p className="mt-5 text-sm text-stone" aria-live="polite">{selection.transaction === "buy" ? "Buy" : selection.transaction === "rent" ? "Rent" : "Stay"}{selection.type ? ` · ${t.types[selection.type]}` : ""}{!latest.isLoading && !latest.isError ? ` · ${shown?.length ?? 0} properties` : ""}</p>
        {shown?.some((l) => l.id < 0) && <p className="mt-3 text-xs text-clay">Preview samples — illustrative properties, not available listings.</p>}
        {latest.isError && <div role="alert" className="border-b border-line py-10 text-stone">Unable to load properties. <button type="button" className="underline underline-offset-4" onClick={() => latest.refetch()}>Try again</button></div>}
        {!latest.isLoading && !latest.isError && !shown?.length && <p className="py-12 text-stone">No properties match this selection yet. Choose another type or transaction.</p>}
        <div className="grid gap-x-8 gap-y-16 pt-12 md:grid-cols-2 lg:grid-cols-3">
          {latest.isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : shown?.map((l, i) => <ListingCard key={l.id} l={l} transaction={selection.transaction === "stay" ? "stay" : undefined} delay={`d${(i % 3) + 1}`} />)}
        </div>
        <div className="mt-14 text-center">
          <Link to={resultsLink} className="btn-line">{t.viewAll}</Link>
        </div>
      </section>

      {/* CONSULTANCY */}
      <section className="mt-28 bg-nude/70 grain md:mt-36">
        <div className="wrap grid items-center gap-12 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden">
              <img src="/images/consult.jpg" alt="" loading="lazy" className="size-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="eyebrow text-clay">{t.home.consultEyebrow}</p>
            <h2 className="display translated-heading mt-5 [--heading-size:44px] md:[--heading-size:64px]">{t.home.consultTitle}</h2>
            <p className="mt-6 max-w-lg text-[17px] text-ink/75">{t.home.consultBody}</p>
            <ul className="mt-10 divide-y divide-sand border-y border-sand">
              {t.consult.services.slice(0, 4).map((s, i) => (
                <li key={s.t} className="flex gap-6 py-4">
                  <span className="font-serif text-clay">0{i + 1}</span>
                  <span>{s.t}</span>
                </li>
              ))}
            </ul>
            <Link to="/consultancy" className="btn-ink mt-10">{t.home.consultCta}</Link>
          </div>
        </div>
      </section>

      {/* AI VISUALISER */}
      <section className="wrap mt-28 md:mt-36">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="eyebrow text-clay">{t.home.visualEyebrow}</p>
            <h2 className="display translated-heading mt-5 [--heading-size:44px] md:[--heading-size:64px]">{t.home.visualTitle}</h2>
            <p className="mt-6 text-[17px] text-stone">{t.home.visualBody}</p>
            <Link to="/visualiser" className="btn-ink mt-10">{t.home.visualCta}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-7">
            <figure>
              <div className="aspect-[4/5] overflow-hidden bg-nude">
                <img src="/images/retail-2.jpg" alt="" loading="lazy" className="size-full object-cover" />
              </div>
              <figcaption className="eyebrow mt-3 text-stone">{t.visual.before}</figcaption>
            </figure>
            <figure className="md:translate-y-12">
              <div className="aspect-[4/5] overflow-hidden bg-nude">
                <img src="/images/mockup-cafe.jpg" alt="" loading="lazy" className="size-full object-cover" />
              </div>
              <figcaption className="eyebrow mt-3 text-clay">{t.visual.after} · Boutique Café</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="wrap mt-36 md:mt-48">
        <div className="grid items-center gap-12 border-t border-line pt-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <FounderPortrait alt={t.about.founderRole} className="mx-auto w-[55%]" />
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <p className="eyebrow text-stone">{t.home.founderEyebrow}</p>
            <blockquote className="display mt-6 text-[34px] md:text-[48px]">“{t.home.founderQuote}”</blockquote>
            <p className="mt-8 font-medium">{t.about.founderName}</p>
            <p className="text-stone">{t.about.founderRole}</p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {t.pillars.map((p) => (
                <div key={p.t}>
                  <div className="h-px w-10 bg-clay" />
                  <h3 className="mt-4 font-serif text-[20px]">{p.t}</h3>
                  <p className="mt-2 text-[14px] text-stone">{p.d}</p>
                </div>
              ))}
            </div>
            <Link to="/about" className="btn-ghost mt-10">{t.home.founderCta}</Link>
          </div>
        </div>
      </section>

      {/* LIST WITH US */}
      <section className="wrap mt-28 md:mt-36">
        <div className="bg-peach/60 px-8 py-16 text-center md:px-20 md:py-24">
          <h2 className="display translated-heading mx-auto max-w-3xl [--heading-size:40px] md:[--heading-size:60px]">{t.home.ownerTitle}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-ink/75">{t.home.ownerBody}</p>
          <Link to="/list-with-us" className="btn-ink mt-10">{t.home.ownerCta}</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap mt-28 md:mt-36">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 className="display translated-heading [--heading-size:36px] md:col-span-4 md:[--heading-size:48px]">{t.home.faqTitle}</h2>
          <div className="md:col-span-8">
            <Faq />
          </div>
        </div>
      </section>
    </>
  );
}
