import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useT } from "../../i18n/context";
import type { TypeKey } from "../../i18n/dict";

export type Transaction = "buy" | "rent" | "stay";
export type HomeSelection = { transaction: Transaction; type?: TypeKey };
const options: Record<Transaction, { type: TypeKey; label: string }[]> = {
  buy: [{ type: "house", label: "Home" }, { type: "condo", label: "Condo" }, { type: "land", label: "Land" }],
  rent: [{ type: "house", label: "Home" }, { type: "condo", label: "Condo" }, { type: "retail", label: "Retail" }, { type: "commercial", label: "Commercial Space" }],
  stay: [{ type: "house", label: "House" }, { type: "condo", label: "Condo" }],
};

export function HomeFilters({ selection, onChange }: { selection: HomeSelection; onChange: (value: HomeSelection) => void }) {
  const { lang, t } = useT();
  const [open, setOpen] = useState<Transaction | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const focusTrigger = (transaction: Transaction) => rootRef.current?.querySelector<HTMLButtonElement>(`[aria-controls="home-${transaction}-options"]`)?.focus();

  useEffect(() => {
    const onOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", onOutside);
    return () => document.removeEventListener("pointerdown", onOutside);
  }, []);

  return (
    <div ref={rootRef} className="reveal d4 border-y border-sand bg-nude/25" aria-label="Property transaction filters">
      <div className="flex justify-center gap-3 sm:gap-16">
        {(["buy", "rent", "stay"] as const).map((transaction) => (
          <div key={transaction} className="relative">
            <button type="button" onKeyDown={(e) => { if (e.key === "Escape") setOpen(null); }} aria-expanded={open === transaction} aria-controls={`home-${transaction}-options`} onClick={() => {
              setOpen(open === transaction ? null : transaction);
              if (selection.transaction !== transaction) onChange({ transaction });
            }} className={`flex min-h-[72px] items-center gap-3 border-b-2 px-3 text-[18px] font-medium tracking-[0.1em] transition-colors hover:bg-nude/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay sm:gap-4 sm:px-5 sm:text-[20px] ${selection.transaction === transaction ? "border-clay text-ink" : "border-transparent text-stone hover:text-ink"} ${open === transaction ? "bg-nude/70" : ""}`}>
              {lang === "th" ? { buy: "ซื้อ", rent: "เช่า", stay: "พัก" }[transaction] : { buy: "Buy", rent: "Rent", stay: "Stay" }[transaction]}
              <ChevronDown strokeWidth={1.5} className={`size-[18px] text-clay transition-transform duration-200 ${open === transaction ? "rotate-180" : ""}`} />
            </button>
            {open === transaction && <div id={`home-${transaction}-options`} className={`absolute top-full z-30 mt-3 w-56 border border-sand bg-paper p-2 shadow-[0_16px_36px_-16px_#2a252240] ${transaction === "stay" ? "right-0" : transaction === "rent" ? "left-1/2 -translate-x-1/2" : "left-0"}`}>
              {options[transaction].map((option) => <button key={option.type} type="button" onKeyDown={(e) => { if (e.key === "Escape") { setOpen(null); focusTrigger(transaction); } }} className="flex min-h-12 w-full items-center justify-between gap-3 px-3 py-3 text-left text-[15px] transition-colors hover:bg-nude hover:text-ink focus-visible:bg-nude focus-visible:outline-clay" onClick={() => { onChange({ transaction, type: option.type }); setOpen(null); focusTrigger(transaction); }}>
                {lang === "th" ? t.types[option.type] : option.label}
                {selection.transaction === transaction && selection.type === option.type && <Check className="size-4 text-clay" />}
              </button>)}
            </div>}
          </div>
        ))}
      </div>
      {selection.type && <div className="flex min-h-11 items-center justify-center gap-4 pb-2 text-[13px] text-stone" aria-live="polite">
        <span>{lang === "th" ? t.types[selection.type] : options[selection.transaction].find((o) => o.type === selection.type)?.label}</span><button type="button" className="underline decoration-clay underline-offset-4" onClick={() => onChange({ transaction: selection.transaction })}>{lang === "th" ? "ล้างตัวกรอง" : "Clear type"}</button>
      </div>}
    </div>
  );
}