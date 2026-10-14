import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, X, ExternalLink, MapPin, ScanSearch } from "lucide-react";
import type { Listing } from "../../queries/listings";

function PlanZoom({ src, onClose }: { src: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={dialog} onCancel={onClose} onClose={onClose} aria-labelledby="plan-zoom-title" className="fixed inset-0 m-auto h-[90dvh] max-h-none w-[94vw] max-w-6xl border border-line bg-paper p-0 text-ink backdrop:bg-ink/70">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
      <h2 id="plan-zoom-title" className="eyebrow">FLOORPLAN</h2>
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Zoom out" disabled={scale <= 1} onClick={() => setScale((v) => Math.max(1, v - 0.5))} className="p-2 disabled:opacity-30"><ZoomOut className="size-5" strokeWidth={1.25} /></button>
        <output aria-live="polite" className="w-14 text-center text-xs">{Math.round(scale * 100)}%</output>
        <button type="button" aria-label="Zoom in" disabled={scale >= 4} onClick={() => setScale((v) => Math.min(4, v + 0.5))} className="p-2 disabled:opacity-30"><ZoomIn className="size-5" strokeWidth={1.25} /></button>
        <button type="button" aria-label="Reset zoom" onClick={() => setScale(1)} className="p-2"><RotateCcw className="size-4" strokeWidth={1.25} /></button>
        <button type="button" aria-label="Close floor plan" onClick={onClose} className="p-2"><X className="size-5" strokeWidth={1.25} /></button>
      </div>
    </div>
    <div className="h-[calc(100%-110px)] overflow-auto bg-nude/40 p-4">
      <div style={{ width: `${scale * 100}%`, minHeight: "100%" }} className="flex items-center justify-center">
        <img src={src} alt="Enlarged property floor plan" className="w-full object-contain" />
      </div>
    </div>
    <p className="px-5 py-3 text-xs text-stone">Zoom in and scroll to inspect the schematic. Press Escape to close.</p>
  </dialog>;
}

export function PropertyLocationPlan({ l, stacked = false }: { l: Listing; stacked?: boolean }) {
  const [open, setOpen] = useState(false);
  const [planFailed, setPlanFailed] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const coordinates = l.latitude != null && l.longitude != null;
  const query = coordinates ? `${l.latitude},${l.longitude}` : [l.district, l.province, "Thailand"].filter(Boolean).join(", ");
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${coordinates ? 16 : 11}&output=embed`;
  useEffect(() => { setPlanFailed(false); setMapLoaded(false); }, [l.id, l.floorPlanUrl, mapUrl]);
  return <section aria-label="Property map and floor plan" className={`mt-10 grid gap-8 border border-line bg-nude/30 p-5 md:p-6 ${stacked ? "" : "md:grid-cols-2"}`}>
    <div className="min-w-0">
      <h2 className="eyebrow mb-4 text-ink">LOCATION</h2>
      <div className="relative h-80 overflow-hidden border border-line bg-paper">
        {!mapLoaded && <span className="absolute inset-0 grid place-items-center text-sm text-stone">Loading map…</span>}
        <iframe key={mapUrl} title={coordinates ? "Property location on Google Maps" : "Approximate district location on Google Maps"} src={mapUrl} loading="lazy" onLoad={() => setMapLoaded(true)} className="relative h-full w-full border-0" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
      </div>
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone"><MapPin className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.25} />{coordinates ? "Map pin uses the property's supplied coordinates." : `Approximate district location: ${l.district}. Not the property's exact address.`}</p>
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs text-ink underline decoration-clay underline-offset-4">Open in Google Maps<ExternalLink className="size-3" /></a>
    </div>
    <div className="min-w-0">
      <h2 className="eyebrow mb-4 text-ink">FLOORPLAN</h2>
      <div className="relative flex h-80 items-center justify-center border border-line bg-paper p-4">
        {l.floorPlanUrl && !planFailed ? <>
          <img src={l.floorPlanUrl} alt={`Floor plan for ${l.title}`} onError={() => setPlanFailed(true)} className="h-full w-full object-contain" />
          <button type="button" aria-label="Enlarge floor plan" onClick={() => setOpen(true)} className="absolute right-3 bottom-3 border border-line bg-paper p-3 text-ink shadow-sm hover:bg-nude"><ScanSearch className="size-5" strokeWidth={1.25} /></button>
        </> : <p className="max-w-48 text-center text-sm text-stone">{planFailed ? "Floor plan could not be loaded." : "Floor plan not yet available. Please enquire for details."}</p>}
      </div>
      {l.floorPlanUrl && !planFailed && <p className="mt-3 text-xs text-stone">Use the zoom button to inspect the floor plan.</p>}
    </div>
    {open && l.floorPlanUrl && <PlanZoom src={l.floorPlanUrl} onClose={() => setOpen(false)} />}
  </section>;
}