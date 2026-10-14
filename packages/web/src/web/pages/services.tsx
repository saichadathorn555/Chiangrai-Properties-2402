import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useT } from "../i18n/context";
import { InquiryForm } from "../components/site/inquiry-form";

export default function ServicesPage() {
  const { t } = useT();
  const s = t.services;
  const [pick, setPick] = useState<string>("");

  function request(title: string) {
    setPick(title);
    document.getElementById("request")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="wrap pt-14">
        <p className="eyebrow reveal d1 text-clay">{s.eyebrow}</p>
        <div className="mt-4 grid gap-10 md:grid-cols-12">
          <h1 className="display translated-heading reveal d2 [--heading-size:48px] md:col-span-8 md:[--heading-size:80px]">{s.title}</h1>
          <p className="reveal d3 self-end text-[17px] text-stone md:col-span-4">{s.intro}</p>
        </div>
      </section>

      <section className="wrap mt-20">
        <div className="grid border-t border-line md:grid-cols-2 lg:grid-cols-3">
          {s.items.map((it, i) => (
            <article
              key={it.id}
              id={it.id}
              className="flex flex-col border-b border-line py-10 md:pr-10 lg:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(3n+1))]:pl-10"
            >
              <span className="font-serif text-[18px] text-clay">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="translated-heading mt-4 font-serif [--heading-size:30px] leading-tight">{it.t}</h2>
              <p className="mt-4 flex-1 text-stone">{it.d}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {it.tags.map((tag) => (
                  <li key={tag} className="border border-line bg-nude/50 px-3 py-1 text-[12px] text-ink/75">
                    {tag}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => request(it.t)} className="btn-ghost mt-6 self-start">
                {s.request} <ArrowRight className="size-3.5" />
              </button>
            </article>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-stone">{s.note}</p>
      </section>

      <section id="request" className="mt-28 bg-nude/70 grain">
        <div className="wrap grid gap-12 py-20 md:grid-cols-12 md:py-28">
          <div className="md:col-span-4">
            <h2 className="display translated-heading [--heading-size:44px] md:[--heading-size:56px]">{s.formTitle}</h2>
            <p className="mt-5 text-stone">{s.formSub}</p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <InquiryForm
              key={pick}
              kind="service"
              submitLabel={s.request}
              extra={[
                { key: "category", label: s.category, type: "select", options: s.items.map((i) => i.t), defaultValue: pick || undefined },
                { key: "when", label: s.when, type: "select", options: s.whenOptions },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
