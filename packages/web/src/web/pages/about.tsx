import { Link } from "wouter";
import { FounderPortrait } from "../components/site/founder-portrait";
import { useT } from "../i18n/context";

export default function AboutPage() {
  const { t } = useT();
  const s = t.story;
  const foundingPhrase = "Chiangrai Properties was established to bridge that gap";
  return (
    <>
      <section id="story" className="wrap pt-14">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="reveal d2 text-center md:col-span-5 md:pt-10">
            <FounderPortrait alt={t.about.founderName} className="mx-auto w-[54%]" />
            <p className="mt-6 font-serif text-[28px]">{t.about.founderName}</p>
            <p className="eyebrow mt-2 text-stone">{t.about.founderRole}</p>
          </div>
          <div className="md:col-span-6 md:col-start-7 md:pt-10">
            <h1 className="display translated-heading reveal d2 [--heading-size:28.8px] md:[--heading-size:36.8px] lg:[--heading-size:48px]">{s.title}</h1>
            <div className="reveal d3 mt-7 border-t border-line pt-7">
              <div className="space-y-6 text-[17px] leading-relaxed text-ink/80">
                {s.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph.startsWith(foundingPhrase) ? <><strong className="font-bold">{foundingPhrase}</strong>{paragraph.slice(foundingPhrase.length)}</> : paragraph}</p>)}
              </div>
            </div>
            <blockquote className="reveal d4 mt-10 border-l-2 border-peach pl-6 font-serif text-[24px] italic leading-snug">
              “{t.home.founderQuote}”
            </blockquote>
          </div>
        </div>
      </section>
      <section id="values" className="wrap mt-28">
        <h2 className="display translated-heading border-b border-line pb-6 [--heading-size:40px]">{t.about.values}</h2>
        <div className="grid gap-10 pt-10 md:grid-cols-3">
          {t.pillars.map((p, i) => (
            <div key={p.t}>
              <span className="font-serif text-clay">0{i + 1}</span>
              <h3 className="mt-3 font-serif text-[28px] leading-tight">{p.t}</h3>
              <p className="mt-3 text-stone">{p.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap gap-4">
          <Link to="/consultancy" className="btn-ink">{t.nav.consultancy}</Link>
          <Link to="/contact" className="btn-line">{t.nav.contact}</Link>
        </div>
      </section>
    </>
  );
}
