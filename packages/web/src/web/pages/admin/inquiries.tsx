import { useMemo, useState } from "react";
import { useDeleteInquiry, useInquiries, useSetInquiryStatus } from "../../queries/inquiries";

const KINDS = {
  all: "All",
  consultation: "Consultation bookings",
  listing: "Property enquiries",
  "list-property": "List with us",
  service: "Service requests",
  partner: "Join Us",
  contact: "General contact",
  newsletter: "Mailing list",
} as const;
type KindKey = keyof typeof KINDS;
const STATUSES = ["new", "contacted", "closed"] as const;

export default function AdminInquiries() {
  const { data, isPending } = useInquiries();
  const setStatus = useSetInquiryStatus();
  const del = useDeleteInquiry();
  const [kind, setKind] = useState<KindKey>("all");
  const [openId, setOpenId] = useState<number | null>(null);

  const rows = useMemo(
    () => (data ?? []).filter((r) => kind === "all" || r.inquiry.kind === kind),
    [data, kind],
  );
  const newCount = (data ?? []).filter((r) => r.inquiry.status === "new").length;

  return (
    <div>
      <h1 className="display text-5xl">Inquiries & bookings</h1>
      <p className="mt-2 text-stone">{newCount} new · {data?.length ?? 0} total</p>

      <div className="mt-8 flex flex-wrap gap-2">
        {(Object.keys(KINDS) as KindKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`eyebrow border px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze ${kind === k ? "border-bronze bg-bronze text-ink" : "border-line text-stone hover:border-bronze hover:text-ink"}`}
          >
            {KINDS[k]}
          </button>
        ))}
      </div>

      <div className="mt-8 border-t border-ink">
        {isPending && <p className="py-10 text-center text-stone">Loading…</p>}
        {!isPending && rows.length === 0 && <p className="py-10 text-center text-stone">Nothing here yet.</p>}
        {rows.map(({ inquiry: q, listingTitle, listingRef }) => {
          const open = openId === q.id;
          const meta = Object.entries(q.meta ?? {}).filter(([, v]) => v);
          return (
            <div key={q.id} className="border-b border-line">
              <button className="grid w-full grid-cols-[1fr_auto] items-center gap-4 py-4 text-left md:grid-cols-[160px_1fr_200px_110px]" onClick={() => setOpenId(open ? null : q.id)}>
                <span className="eyebrow hidden text-stone md:block">{KINDS[q.kind as KindKey] ?? q.kind}</span>
                <span>
                  <span className="font-medium">{q.name}</span>
                  <span className="ml-2 text-sm text-stone">{q.email}</span>
                  {listingTitle && <span className="block text-xs text-clay">Re: {listingTitle} ({listingRef})</span>}
                </span>
                <span className="hidden text-sm text-stone md:block">{new Date(q.createdAt).toLocaleString()}</span>
                <span className={`eyebrow justify-self-end px-2 py-1 text-[10px] ${q.status === "new" ? "bg-peach text-ink" : q.status === "contacted" ? "bg-nude text-ink" : "text-stone"}`}>
                  {q.status}
                </span>
              </button>
              {open && (
                <div className="grid gap-6 pb-6 md:grid-cols-[1fr_280px]">
                  <div className="space-y-3 text-sm">
                    {q.phone && <p><span className="text-stone">Phone:</span> {q.phone}</p>}
                    {meta.map(([k, v]) => (
                      <p key={k}><span className="text-stone">{/\s/.test(k) ? k : k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}:</span> {v}</p>
                    ))}
                    {q.message && <p className="whitespace-pre-wrap border-l-2 border-sand pl-4 leading-relaxed">{q.message}</p>}
                  </div>
                  <div className="space-y-3">
                    <span className="label">Status</span>
                    <select
                      className="field"
                      aria-label="Status"
                      value={q.status}
                      onChange={(e) => setStatus.mutate({ id: q.id, status: e.target.value as (typeof STATUSES)[number] })}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div className="flex gap-4 pt-2">
                      <a className="eyebrow hover:text-clay" href={`mailto:${q.email}`}>Email</a>
                      {q.phone && <a className="eyebrow hover:text-clay" href={`tel:${q.phone}`}>Call</a>}
                      <button
                        className="eyebrow ml-auto text-red-700"
                        onClick={() => { if (confirm("Delete this inquiry?")) del.mutate({ id: q.id }); }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
