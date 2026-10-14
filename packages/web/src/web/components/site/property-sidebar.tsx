import { useState } from "react";
import { Download, Loader2, UserRound } from "lucide-react";
import type { Listing } from "../../queries/listings";
import { propertyAdvisors, propertyInformation } from "../../lib/property-summary";

export function PropertySidebar({ l, sample }: { l: Listing; sample: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function download() {
    setBusy(true); setError(""); setNotice("");
    try {
      if (!sample && l.publication === "published") {
        if (!l.brochureUrl) throw new Error("Published brochure unavailable. Please contact your advisor.");
        const response = await fetch(l.brochureUrl);
        if (!response.ok) throw new Error("Brochure download failed. Please try again.");
        const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a");
        link.href = url; link.download = `${l.ref.replace(/[^a-z0-9-]/gi, "-")}-brochure.pdf`; link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 60000); return;
      }
      const { generatePropertyBrochure } = await import("../../lib/property-brochure");
      const { blob, missingMedia } = await generatePropertyBrochure(l, sample);
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = `${l.ref.replace(/[^a-z0-9-]/gi, "-")}-brochure.pdf`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      if (missingMedia) setNotice("Brochure downloaded with unavailable media clearly marked. Contact your advisor for the originals.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not create the brochure. Please try again."); }
    finally { setBusy(false); }
  }
  return <aside className="min-w-0 lg:col-span-4">
    <div className="border border-line bg-paper p-6 md:p-7">
      <h2 className="eyebrow mb-5 text-stone">KEY INFORMATION</h2>
      <dl>{propertyInformation(l).map(([label, value]) => <div key={label} className="grid grid-cols-[1fr_1.15fr] gap-4 border-b border-line py-3 text-[13px]"><dt className="text-stone">{label}</dt><dd className="text-right font-medium break-words">{value}</dd></div>)}</dl>
      <div className="mt-7 border-t border-line pt-6">
        <p className="eyebrow mb-5 text-stone">DEDICATED {propertyAdvisors(l).length > 1 ? "ADVISORS" : "ADVISOR"}</p>
        {propertyAdvisors(l).map((agent) => <div key={agent.name} className="mb-5 flex items-center gap-4">
          {agent.imageUrl ? <img src={agent.imageUrl} alt={agent.name} className="size-16 shrink-0 rounded-full object-cover object-[50%_15%]" /> : <span className="grid size-16 shrink-0 place-items-center rounded-full bg-nude"><UserRound className="size-7 text-stone" /></span>}
          <div><p className="text-[15px] font-medium">{agent.name}</p><p className="mt-1 text-[12px] text-stone">{agent.title}</p></div>
        </div>)}
      </div>
      <div className="grid gap-3">
        <button onClick={download} disabled={busy} className="btn-line w-full px-3 tracking-[0.1em]">{busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" strokeWidth={1.25} />}{busy ? "Preparing brochure…" : "DOWNLOAD PROPERTY BROCHURE"}</button>
        <a href="#property-enquiry" className="btn-ink w-full px-3">CONTACT ADVISOR</a>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {notice && <output className="mt-4 block text-xs text-stone">{notice}</output>}
      {sample && <p className="mt-4 text-xs text-clay">Sample brochure only. This property is not available.</p>}
      {!sample && l.publication === "draft" && <p className="mt-4 text-xs text-clay">Owner draft preview. Not published or visible in search.</p>}
    </div>
  </aside>;
}