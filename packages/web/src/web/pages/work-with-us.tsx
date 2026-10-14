import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useT } from "../i18n/context";
import { InquiryForm } from "../components/site/inquiry-form";

const IMAGES: Record<string, string> = {
  owners: "/images/house-3.jpg",
  partner: "/images/commercial-2.jpg",
  agents: "/images/retail-2.jpg",
  careers: "/images/consult.jpg",
};

export default function WorkWithUsPage() {
  const { t, lang } = useT();
  const w = t.work;
  const [interest, setInterest] = useState<string>("");

  // Cards 2–4 map onto the form's interest options, in order.
  function choose(idx: number) {
    setInterest(w.interests[idx - 1] ?? "");
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="wrap pt-14">
        <p className="eyebrow reveal d1 text-clay">{w.eyebrow}</p>
        <div lang={lang} className="section-title-grid mt-4 grid gap-10 md:grid-cols-12">
          <h1 lang={lang} className="display translated-heading thai-section-title min-w-0 reveal d2 [--heading-size:48px] md:col-span-8 md:[--heading-size:80px]">{lang === "th" ? <><span className="thai-heading-phrase">มาสร้างสิ่งดี ๆ</span><wbr /><span className="thai-heading-phrase"> ในเชียงราย</span><wbr /><span className="thai-heading-phrase">ไปด้วยกัน</span></> : w.title}</h1>
          <p className="section-title-description min-w-0 reveal d3 self-end text-[17px] text-stone md:col-span-4">{w.intro}</p>
        </div>
      </section>

      <section className="wrap mt-20 grid gap-x-8 gap-y-16 md:grid-cols-2">
        {w.cards.map((c, i) => (
          <article key={c.id} id={c.id} className="flex flex-col">
            <div className="aspect-[16/10] overflow-hidden bg-nude">
              <img src={IMAGES[c.id]} alt="" className="size-full object-cover" />
            </div>
            <span className="mt-6 font-serif text-clay">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="translated-heading mt-2 font-serif [--heading-size:34px] leading-tight">{c.t}</h2>
            <p className="mt-3 max-w-lg flex-1 text-stone">{c.d}</p>
            {c.to.startsWith("/") ? (
              <Link to={c.to} className="btn-ghost mt-6 self-start">
                {c.cta} <ArrowRight className="size-3.5" />
              </Link>
            ) : (
              <button type="button" onClick={() => choose(i)} className="btn-ghost mt-6 self-start">
                {c.cta} <ArrowRight className="size-3.5" />
              </button>
            )}
          </article>
        ))}
      </section>

      <section id="form" className="mt-28 bg-nude/70 grain">
        <div className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-4">
            <h2 className="display translated-heading [--heading-size:44px] md:[--heading-size:56px]">{w.formTitle}</h2>
            <p className="mt-5 text-stone">{w.formSub}</p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <InquiryForm
              key={interest}
              kind="partner"
              submitLabel={w.submit}
              extra={[
                { key: "category", label: w.interest, type: "select", options: w.interests, defaultValue: interest || undefined },
                { key: "company", label: w.company, type: "text" },
                { key: "website", label: w.website, type: "text" },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
