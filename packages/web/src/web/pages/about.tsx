import { Link } from "wouter";
import { FounderPortrait } from "../components/site/founder-portrait";
import { useT } from "../i18n/context";

export default function AboutPage() {
  const { t } = useT();
  const s = t.story;
  return (
    <>
      <section id="story" className="wrap pt-14">
        <h1 className="reveal d1 text-[40px] font-medium tracking-[0.12em] text-[#C3A38A] md:text-[56px]">ABOUT US</h1>
        <div className="mt-10 grid gap-12 border-t border-line pt-10 md:grid-cols-12">
          <div className="reveal d2 text-center md:col-span-5">
            <FounderPortrait alt={t.about.founderName} className="mx-auto w-[54%]" />
            <p className="mt-6 font-serif text-[28px] text-[#77230D]">{t.about.founderName}</p>
            <p className="eyebrow mt-2 font-bold text-stone">{t.about.founderRole}</p>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <div className="reveal d3">
              <div className="space-y-7 text-[17px] leading-[1.85] text-ink/80">
                {s.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph.startsWith(s.bold) ? <><strong className="font-semibold text-ink">{s.bold}</strong>{paragraph.slice(s.bold.length)}</> : paragraph}</p>)}
              </div>
            </div>
            <blockquote className="reveal d4 mt-12 border-l-2 border-peach pl-6 font-serif text-[22px] italic leading-[1.5] text-ink md:text-[24px]">
              “{s.quote}”
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
