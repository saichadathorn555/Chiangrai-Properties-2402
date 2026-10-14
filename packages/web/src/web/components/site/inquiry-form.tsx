import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useT } from "../../i18n/context";
import { useSubmitInquiry } from "../../queries/inquiries";
import { INQUIRY_ERROR, INQUIRY_SUCCESS } from "../../lib/inquiry-feedback";
import { inquiryFieldName } from "../../../inquiry-fields";

type Kind = "listing" | "contact" | "list-property" | "consultation" | "service" | "partner";

export type ExtraField = { fullWidth?: boolean } & (
  | { key: string; label: string; type: "text" | "date" | "number"; placeholder?: string }
  | { key: string; label: string; type: "select"; options: string[]; defaultValue?: string });

export function InquiryForm({
  kind,
  listingId,
  extra = [],
  submitLabel,
  buttonTone = "ink",
  defaultMessage = "",
  compact = false,
}: {
  kind: Kind;
  listingId?: number;
  extra?: ExtraField[];
  submitLabel?: string;
  buttonTone?: "ink" | "bronze";
  defaultMessage?: string;
  compact?: boolean;
}) {
  const { t } = useT();
  const submit = useSubmitInquiry();
  const [done, setDone] = useState(false);
  const [submissionId] = useState(() => crypto.randomUUID());

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submit.isPending) return;
    const fd = new FormData(e.currentTarget);
    const meta: Record<string, string> = {};
    for (const f of extra) {
      const v = String(fd.get(inquiryFieldName(f.key)) ?? "").trim();
      if (v) meta[f.key] = v;
    }
    submit.mutate(
      {
        kind,
        submissionId,
        website: String(fd.get("_honey") || ""),
        listingId,
        name: String(fd.get("Full Name")),
        email: String(fd.get("Email Address")),
        phone: String(fd.get("Phone Number") || "") || undefined,
        message: String(fd.get("Message") || ""),
        meta,
      },
      { onSuccess: () => setDone(true) },
    );
  }

  if (done) {
    return (
      <output className="flex items-start gap-4 border border-line bg-peach/40 p-6">
        <Check className="mt-1 size-5 shrink-0 text-clay" />
        <span>{INQUIRY_SUCCESS}</span>
      </output>
    );
  }

  const grid = compact ? "grid gap-4" : "grid gap-5 md:grid-cols-2";
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="hidden" aria-hidden="true"><input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-label="Leave empty" /></div>
      <div className={grid}>
        <div>
          <label className="label">{t.form.name}</label>
          <input name="Full Name" required className="field" aria-label={t.form.name} />
        </div>
        <div>
          <label className="label">{t.form.email}</label>
          <input name="Email Address" type="email" required className="field" aria-label={t.form.email} />
        </div>
        <div className={compact ? "" : "md:col-span-2"}>
          <label className="label">{t.form.phone}</label>
          <input name="Phone Number" className="field" aria-label={t.form.phone} />
        </div>
        {extra.map((f) => (
          <div key={f.key} className={!compact && f.fullWidth ? "md:col-span-2" : undefined}>
            <label className="label">{f.label}</label>
            {f.type === "select" ? (
              <select name={inquiryFieldName(f.key)} className="field" aria-label={f.label} defaultValue={f.defaultValue}>
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input name={inquiryFieldName(f.key)} type={f.type} placeholder={f.placeholder} className="field" aria-label={f.label} />
            )}
          </div>
        ))}
      </div>
      <div>
        <label className="label">{t.form.message}</label>
        <textarea name="Message" rows={compact ? 4 : 5} defaultValue={defaultMessage} className="field resize-none" aria-label={t.form.message} />
      </div>
      {submit.isError && <p role="alert" className="text-sm text-red-700">{INQUIRY_ERROR}</p>}
      <button type="submit" disabled={submit.isPending} className={buttonTone === "bronze" ? "inline-flex min-h-13 w-full items-center justify-center gap-3 border border-bronze bg-bronze px-8 py-3.5 text-[16px] font-medium text-ink transition-colors hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze disabled:cursor-wait disabled:opacity-60 md:w-auto" : "btn-ink w-full md:w-auto"}>
        {submit.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> {t.form.sending}
          </>
        ) : (
          submitLabel ?? t.form.send
        )}
      </button>
    </form>
  );
}
