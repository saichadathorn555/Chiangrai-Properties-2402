import { Link, useParams } from "wouter";
import { ArrowLeft, Check, Lightbulb, MapPin, Sparkles, LayoutGrid } from "lucide-react";
import { PropertyGallery } from "../components/site/property-gallery";
import { PropertySidebar } from "../components/site/property-sidebar";
import { propertyPrice } from "../lib/property-summary";
import { PropertyLocationPlan } from "../components/site/property-location-plan";
import { useT } from "../i18n/context";
import { useListing } from "../queries/listings";
import { fmtNum } from "../lib/format";
import { ListingCard, pickLang } from "../components/site/listing-card";
import { InquiryForm } from "../components/site/inquiry-form";
import { WhatsAppIcon, LineIcon } from "../components/site/layout";
import { lineHref, whatsappHref } from "../lib/site";

function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="prose-cr">
      {blocks.map((b, i) =>
        b.startsWith("## ") ? <h2 key={i} lang={/[฀-๿]/.test(b) ? "th" : "en"} className="translated-heading [--heading-size:28px]">{b.slice(3)}</h2> : <p key={i}>{b}</p>,
      )}
    </div>
  );
}

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useT();
  const q = useListing(Number(id));

  if (q.isLoading) {
    return (
      <div className="wrap animate-pulse pt-14">
        <div className="h-4 w-40 bg-nude" />
        <div className="mt-6 h-16 w-3/4 bg-nude" />
        <div className="mt-10 aspect-[16/7] bg-nude" />
      </div>
    );
  }
  if (!q.data) {
    return (
      <div className="wrap py-32 text-center">
        <p className="display text-4xl">Not found</p>
        <Link to="/properties" className="btn-line mt-8">{t.detail.back}</Link>
      </div>
    );
  }

  const { listing: l, similar } = q.data;
  const imgs = l.imageUrls;
  const layoutTotal = l.layout.reduce((s, r) => s + r.sqm, 0);
  const layoutMax = Math.max(1, ...l.layout.map((r) => r.sqm));
  const title = pickLang(l.title, l.titleTh, lang);
  const summary = pickLang(l.summary, l.summaryTh, lang);
  const description = pickLang(l.description, l.descriptionTh, lang);

  return (
    <div className="pt-10">
      {q.isSample && <p className="wrap mb-6 text-sm text-clay">PREVIEW SAMPLE — illustrative property, not available for sale, rent or booking.</p>}
      <div className="wrap">
        <Link to="/properties" className="eyebrow inline-flex items-center gap-2 text-stone hover:text-ink">
          <ArrowLeft className="size-3.5" /> {t.detail.back}
        </Link>

        <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="eyebrow reveal d1 text-clay">
              {t.deal[l.deal]} · {t.types[l.type]}
              {l.status !== "available" && ` · ${t.status[l.status]}`}
            </p>
            <h1 lang={lang === "th" && l.titleTh ? "th" : "en"} className="display translated-heading reveal d2 mt-4 [--heading-size:36px] md:[--heading-size:50px]">{title}</h1>
            <p className="reveal d3 mt-5 flex items-center gap-2 text-stone">
              <MapPin className="size-4" strokeWidth={1.25} />
              {[l.subdistrict, l.district, l.province].filter(Boolean).join(", ")}
            </p>
          </div>
          <div className="reveal d3 md:col-span-4 md:text-right">
            <p className="eyebrow text-stone">{t.detail.price}</p>
            <p className="mt-2 text-[24px] font-medium tracking-wide md:text-[28px]">{propertyPrice(l)}</p>
          </div>
        </div>
      </div>

      <div className="wrap"><PropertyGallery key={l.id} images={imgs} title={title} /></div>

      <div className="wrap mt-10 grid gap-10 lg:grid-cols-12">
        {/* Main */}
        <div className="lg:col-span-8">
          <h2 className="font-serif text-[30px] uppercase tracking-[0.13em] md:text-[36px]">PROPERTY DETAILS</h2>
          <p className="mt-5 text-[16px] leading-[1.8] text-ink/85">{summary}</p>
          <RichText text={description} />
          <PropertyLocationPlan key={l.id} l={l} stacked />

          {l.features.length > 0 && (
            <div className="mt-12">
              <p className="eyebrow text-stone">{t.detail.features}</p>
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3">
                {l.features.map((f) => (
                  <span key={f} className="flex items-center gap-2.5 text-[14px]">
                    <Check className="size-3.5 text-clay" /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Layout & floor plan */}
          {l.layout.length > 0 && (
            <section id="layout" className="mt-16 border-t border-line pt-10">
              <div className="flex items-center gap-3">
                <LayoutGrid className="size-4 text-clay" strokeWidth={1.25} />
                <p className="eyebrow text-stone">{t.detail.layout}</p>
              </div>
              <h2 className="display translated-heading mt-4 [--heading-size:36px] md:[--heading-size:44px]">{t.detail.layoutSub}</h2>
              <div className="mt-8">
                {l.layout.length > 0 && (
                  <div>
                    <div className="eyebrow flex justify-between border-b border-ink pb-3 text-stone">
                      <span>{t.detail.room}</span>
                      <span>{t.detail.area} ({t.sqm})</span>
                    </div>
                    {l.layout.map((r) => (
                      <div key={r.name} className="border-b border-line py-3.5">
                        <div className="flex justify-between gap-4 text-[14px]">
                          <span>{lang === "th" && r.nameTh ? r.nameTh : r.name}</span>
                          <span className="tabular-nums">{fmtNum(r.sqm, lang)}</span>
                        </div>
                        <div className="mt-2 h-[3px] bg-nude">
                          <div className="h-full bg-peach" style={{ width: `${(r.sqm / layoutMax) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-4 font-medium">
                      <span>{t.detail.total}</span>
                      <span className="tabular-nums">
                        {fmtNum(layoutTotal, lang)} {t.sqm}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {l.insiderTip && (
            <div className="mt-16 bg-peach/50 p-8 md:p-10">
              <div className="flex items-center gap-3">
                <Lightbulb className="size-4 text-clay" strokeWidth={1.5} />
                <p className="eyebrow">{t.detail.insider}</p>
              </div>
              <p className="mt-4 font-serif text-[22px] leading-snug">{l.insiderTip}</p>
            </div>
          )}

          {l.advisory.length > 0 && (
            <div className="mt-16">
              <p className="eyebrow text-stone">{t.detail.advisory}</p>
              <div className="mt-5 border-t border-ink">
                {l.advisory.map((a) => (
                  <div key={a.factor} className="grid gap-2 border-b border-line py-4 md:grid-cols-[200px_1fr]">
                    <span className="font-medium">{a.factor}</span>
                    <span className="text-ink/80">{a.detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI visualiser CTA */}
          {!q.isSample && <Link
            to={`/visualiser?listing=${l.id}`}
            className="group mt-16 grid items-center gap-6 border border-bronze p-6 transition-colors hover:bg-bronze focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze md:grid-cols-[auto_1fr_auto] md:p-8"
          >
            <Sparkles className="size-7 text-clay" strokeWidth={1.25} />
            <div>
              <p className="font-serif text-[26px] leading-tight">{t.detail.visualise}</p>
              <p className="mt-1 text-[14px] opacity-70">{t.detail.visualiseSub}</p>
            </div>
            <span className="eyebrow">→</span>
          </Link>}

          {l.ownership && <p className="mt-12 text-[12px] leading-relaxed text-stone">{l.ownership}</p>}
        </div>

        {/* Sidebar */}
        <PropertySidebar l={l} sample={q.isSample} />
      </div>

      <section id="property-enquiry" className="wrap mt-20">
        <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-2">
          <div><p className="eyebrow text-clay">Ref: {l.ref}</p><h2 className="display mt-4 text-[40px]">Contact your advisor</h2><p className="mt-4 text-stone">Arrange a private viewing or request more information about this property.</p></div>
          <div>{q.isSample ? <p className="text-sm text-clay">This is a preview sample. Enquiries and bookings are disabled.</p> : <><InquiryForm key={l.id} kind="listing" listingId={l.id} defaultMessage={`I'm interested in ${l.ref} — ${l.title}.`} /><div className="mt-6 flex gap-3"><a href={whatsappHref(`Hello, I'm interested in ${l.ref}: ${l.title}`)} target="_blank" rel="noreferrer" className="btn-line"><WhatsAppIcon /> WhatsApp</a><a href={lineHref()} target="_blank" rel="noreferrer" className="btn-line"><LineIcon /> LINE</a></div></>}</div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="wrap mt-28">
          <h2 className="display translated-heading border-b border-line pb-6 [--heading-size:40px]">{t.detail.similar}</h2>
          <div className="grid gap-x-8 gap-y-16 pt-10 md:grid-cols-3">
            {similar.map((s) => <ListingCard key={s.id} l={s} />)}
          </div>
        </section>
      )}

    </div>
  );
}
