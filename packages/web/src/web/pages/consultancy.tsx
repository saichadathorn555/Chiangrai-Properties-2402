import { useT } from "../i18n/context";
import { ContactInquiryForm } from "../components/site/contact-inquiry-form";

const consultationServices = [
  "Residential Rental & Tenant Placement",
  "Commercial & Retail Site Selection",
  "Property Listing & Pricing Strategy (for Owners)",
  "Buying & Investment Advisory",
  "Foreign Ownership Guidance",
  "Land & Development Feasibility",
  "Others",
];

export default function ConsultancyPage() {
  const { t, lang } = useT();
  const c = t.consult;
  return (
    <>
      <section className="wrap pt-14">
        <p className="eyebrow reveal d1 text-clay">{c.eyebrow}</p>
        <div lang={lang} className="section-title-grid mt-4 grid gap-10 md:grid-cols-12">
          <h1 lang={lang} className="display translated-heading thai-section-title min-w-0 reveal d2 [--heading-size:52px] md:col-span-8 md:[--heading-size:88px]">{lang === "th" ? <><span className="thai-heading-phrase">คิดให้ชัด</span><wbr /><span className="thai-heading-phrase">ในทุกการตัดสินใจ</span><wbr /><span className="thai-heading-phrase">เรื่องอสังหาฯ</span></> : c.title}</h1>
          <p className="section-title-description min-w-0 reveal d3 self-end text-[17px] text-stone md:col-span-4">{c.intro}</p>
        </div>
        <div className="reveal d4 mt-14 grid gap-3 md:grid-cols-3">
          <img src="/images/consult.jpg" alt="" className="aspect-[4/5] w-full object-cover md:col-span-1" />
          <img src="/images/commercial-1.jpg" alt="" className="aspect-[4/5] w-full object-cover md:col-span-2 md:aspect-auto md:h-full" />
        </div>
      </section>

      <section className="wrap mt-28">
        <div className="grid border-t border-line md:grid-cols-2 lg:grid-cols-3">
          {c.services.map((s, i) => (
            <div key={s.t} className="border-b border-line py-10 md:pr-10 lg:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(3n+1))]:pl-10">
              <span className="font-serif text-[18px] text-clay">0{i + 1}</span>
              <h3 className="mt-4 font-serif text-[30px] leading-tight">{s.t}</h3>
              <p className="mt-4 text-stone">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[12px] text-stone">{c.note}</p>
      </section>

      <section id="process" className="mt-28 bg-nude/70 grain">
        <div className="wrap py-20 md:py-28">
          <h2 className="display translated-heading [--heading-size:44px] md:[--heading-size:60px]">{c.processTitle}</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-4">
            {c.process.map((p, i) => (
              <div key={p.t} className="border-t border-ink pt-6">
                <span className="eyebrow text-clay">Step {i + 1}</span>
                <h3 className="mt-3 font-serif text-[26px]">{p.t}</h3>
                <p className="mt-2 text-[14px] text-ink/70">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="book" className="wrap mt-28">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 className="display translated-heading [--heading-size:44px] md:[--heading-size:56px]">{c.bookTitle}</h2>
            <p className="mt-5 text-stone">{c.bookSub}</p>
          </div>
          <div className="md:col-span-7 md:col-start-6">
            <ContactInquiryForm
              submitLabel={c.submit}
              consultationServices={consultationServices}
            />
          </div>
        </div>
      </section>
    </>
  );
}
