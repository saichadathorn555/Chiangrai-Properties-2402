import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { useSubmitInquiry } from "../../queries/inquiries";
import { useT } from "../../i18n/context";
import { INQUIRY_ERROR, INQUIRY_SUCCESS } from "../../lib/inquiry-feedback";

const countries = [
  ["TH", "🇹🇭", "+66", "Thailand"],
  ["AU", "🇦🇺", "+61", "Australia"],
  ["CA", "🇨🇦", "+1", "Canada"],
  ["CN", "🇨🇳", "+86", "China"],
  ["FR", "🇫🇷", "+33", "France"],
  ["DE", "🇩🇪", "+49", "Germany"],
  ["HK", "🇭🇰", "+852", "Hong Kong"],
  ["IN", "🇮🇳", "+91", "India"],
  ["ID", "🇮🇩", "+62", "Indonesia"],
  ["JP", "🇯🇵", "+81", "Japan"],
  ["LA", "🇱🇦", "+856", "Laos"],
  ["MY", "🇲🇾", "+60", "Malaysia"],
  ["MM", "🇲🇲", "+95", "Myanmar"],
  ["NL", "🇳🇱", "+31", "Netherlands"],
  ["NZ", "🇳🇿", "+64", "New Zealand"],
  ["SG", "🇸🇬", "+65", "Singapore"],
  ["KR", "🇰🇷", "+82", "South Korea"],
  ["CH", "🇨🇭", "+41", "Switzerland"],
  ["AE", "🇦🇪", "+971", "United Arab Emirates"],
  ["GB", "🇬🇧", "+44", "United Kingdom"],
  ["US", "🇺🇸", "+1", "United States"],
  ["VN", "🇻🇳", "+84", "Vietnam"],
] as const;

const subjects = [
  "I'd like to Buy",
  "I'd like to Rent",
  "I'd like to Stay (Short-term)",
  "I'd like to list a property for Sale",
  "I'd like to list a property for Rent",
];

const field = "min-h-14 w-full min-w-0 border border-line bg-white/40 px-4 py-3.5 text-[16px] text-ink placeholder:text-stone focus:border-[#B89270] focus:outline-none focus:ring-1 focus:ring-[#B89270]";

export function ContactInquiryForm({ consultationServices, submitLabel }: { consultationServices?: string[]; submitLabel?: string } = {}) {
  const consultation = Boolean(consultationServices);
  const nameField = consultation ? "Name" : "Full Name";
  const emailField = consultation ? "Email" : "Email Address";
  const phoneField = consultation ? "Phone" : "Phone Number";
  const { t } = useT();
  const submit = useSubmitInquiry();
  const [country, setCountry] = useState("TH");
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [submissionId] = useState(() => crypto.randomUUID());
  const selectedCountry = countries.find((c) => c[0] === country) ?? countries[0];

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (!countryRef.current?.contains(event.target as Node)) setCountryOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && countryRef.current?.contains(document.activeElement)) {
        setCountryOpen(false);
        countryRef.current.querySelector('button')?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submit.isPending) return;
    const data = new FormData(event.currentTarget);
    const name = String(data.get(nameField) ?? "").trim();
    const surname = String(data.get("Surname") ?? "").trim();
    const phone = String(data.get(phoneField) ?? "").trim();
    submit.mutate({
      kind: consultation ? "consultation" : "contact",
      submissionId,
      website: String(data.get("_honey") || ""),
      name: `${name} ${surname}`.trim(),
      email: String(data.get(emailField) ?? "").trim(),
      phone: phone ? `${selectedCountry[2]} ${phone}` : undefined,
      message: String(data.get("Message") ?? "").trim(),
      meta: consultation
        ? { first_name: name, surname, service: String(data.get("Requested Service")), maximum_budget: String(data.get("Maximum Budget (THB)") ?? "").trim() }
        : { first_name: name, surname, subject: String(data.get("Subject")), country: selectedCountry[3], country_code: selectedCountry[2] },
    }, { onSuccess: () => setDone(true) });
  }

  if (done) return <output className="flex items-start gap-4 border border-sand bg-nude/40 p-6"><Check className="mt-1 size-5 shrink-0 text-[#B89270]" /><span>{INQUIRY_SUCCESS}</span></output>;

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label={consultation ? "Request a consultation" : "Contact enquiry"}>
      <div className="hidden" aria-hidden="true"><input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-label="Leave empty" /></div>
      <div className="grid grid-cols-2 gap-4">
        {/* oxlint-disable-next-line jsx-a11y/autocomplete-valid -- given-name is a standard HTML autofill token. */}
        <input name={nameField} aria-label="Name" placeholder="Name" autoComplete="given-name" required maxLength={90} pattern=".*\S.*" className={field} />
        {/* oxlint-disable-next-line jsx-a11y/autocomplete-valid -- family-name is a standard HTML autofill token. */}
        <input name="Surname" aria-label="Surname" placeholder="Surname" autoComplete="family-name" required maxLength={90} pattern=".*\S.*" className={field} />
      </div>
      <input name={emailField} aria-label="E-mail" placeholder="E-mail" type="email" autoComplete="email" required className={field} />
      <div className="flex min-w-0 border border-line bg-white/40 focus-within:border-[#B89270] focus-within:ring-1 focus-within:ring-[#B89270]">
        <div ref={countryRef} className="relative w-[122px] shrink-0 border-r border-line bg-nude/40">
          {!consultation && <input type="hidden" name="Country" value={country} />}
          <button type="button" aria-label={`Country code: ${selectedCountry[3]} ${selectedCountry[2]}`} aria-expanded={countryOpen} aria-controls="contact-country-options" onClick={() => setCountryOpen(!countryOpen)} className="flex h-full min-h-14 w-full items-center justify-center gap-2 px-3 focus-visible:outline-2 focus-visible:outline-[#B89270]">
            <img src={`/images/flags/${country.toLowerCase()}.png`} alt={selectedCountry[3]} width={22} height={15} className="h-[15px] w-[22px] object-cover" />
            <span className="whitespace-nowrap text-[16px]">{selectedCountry[2]}</span>
            <ChevronDown className={`size-3.5 shrink-0 text-[#B89270] transition-transform ${countryOpen ? "rotate-180" : ""}`} />
          </button>
          {countryOpen && <div id="contact-country-options" className="absolute left-0 top-full z-30 mt-2 max-h-60 w-64 overflow-y-auto border border-sand bg-paper p-1 shadow-lg">
            {countries.map(([id, , code, name]) => <button type="button" key={id} aria-pressed={id === country} onClick={() => { setCountry(id); setCountryOpen(false); countryRef.current?.querySelector('button')?.focus(); }} className={`flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-nude focus-visible:bg-nude focus-visible:outline-[#B89270] ${id === country ? "bg-nude/70" : ""}`}><img src={`/images/flags/${id.toLowerCase()}.png`} alt="" width={22} height={15} className="h-[15px] w-[22px] object-cover" /><span>{name}</span><span className="ml-auto text-stone">{code}</span></button>)}
          </div>}
        </div>
        <input name={phoneField} aria-label="Phone number" placeholder="Phone number" type="tel" autoComplete="tel-national" maxLength={40} pattern="[0-9 ()\-\.]+" className="min-h-14 w-full min-w-0 bg-transparent px-4 py-3.5 text-[16px] placeholder:text-stone focus:outline-none" />
      </div>
      <div className="relative">
        <label htmlFor="contact-subject" className="absolute left-4 top-2 text-[11px] text-stone">{consultation ? "SERVICE" : "Subject"}</label>
        <select id="contact-subject" name={consultation ? "Requested Service" : "Subject"} className={`${field} appearance-none pb-2! pt-6! pr-10!`}>
          {(consultationServices ?? subjects).map((subject) => <option key={subject}>{subject}</option>)}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-[#B89270]" />
      </div>
      {consultation && <div>
        <label htmlFor="consultation-budget" className="label">MAXIMUM BUDGET (THB)</label>
        <input id="consultation-budget" name="Maximum Budget (THB)" aria-label="MAXIMUM BUDGET (THB)" type="text" inputMode="decimal" className={field} />
      </div>}
      <textarea name="Message" aria-label="Message" placeholder="Message" required maxLength={5000} rows={5} className={`${field} block resize-y`} />
      {submit.isError && <p role="alert" className="text-sm text-red-700">{INQUIRY_ERROR}</p>}
      <button type="submit" disabled={submit.isPending} className="inline-flex min-h-13 w-full items-center justify-center gap-3 border border-bronze bg-bronze px-8 py-3.5 text-[16px] font-medium text-ink transition-colors hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {submit.isPending ? <><Loader2 className="size-4 animate-spin" />{t.form.sending}</> : (submitLabel ?? "Submit Enquiry")}
      </button>
    </form>
  );
}