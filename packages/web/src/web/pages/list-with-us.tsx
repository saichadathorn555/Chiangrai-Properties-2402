import { useT } from "../i18n/context";
import { TYPE_KEYS } from "../i18n/dict";
import { InquiryForm } from "../components/site/inquiry-form";

export default function ListWithUsPage() {
  const { t } = useT();
  const w = t.listWithUs;
  return (
    <section className="wrap pt-14">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="eyebrow reveal d1 text-clay">{w.eyebrow}</p>
          <h1 className="display translated-heading reveal d2 mt-4 [--heading-size:48px] md:[--heading-size:72px]">{w.title}</h1>
          <p className="reveal d3 mt-6 text-[17px] text-stone">{w.sub}</p>
          <p className="reveal d3 mt-6 text-stone">{t.home.ownerBody}</p>
          <img src="/images/house-1.jpg" alt="" className="reveal d4 mt-10 aspect-[4/3] w-full object-cover" />
        </div>
        <div className="md:col-span-6 md:col-start-7 md:pt-8">
          <InquiryForm
            kind="list-property"
            submitLabel={w.submit}
            extra={[
              { key: "intent", label: w.intent, type: "select", options: [t.deal.sale, t.deal.rent] },
              { key: "ptype", label: w.propertyType, type: "select", options: TYPE_KEYS.map((k) => t.types[k]) },
              { key: "location", label: w.location, type: "text" },
              { key: "size", label: w.size, type: "number" },
              { key: "expected", label: w.expected, type: "text" },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
