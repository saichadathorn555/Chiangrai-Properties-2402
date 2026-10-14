import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

function PhotoDialog({ images, title, start, close }: { images: string[]; title: string; start: number; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(start);
  useEffect(() => {
    ref.current?.showModal();
    const old = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, []);
  const move = (delta: number) => setActive((i) => (i + delta + images.length) % images.length);
  return <dialog ref={ref} onCancel={close} onClose={close} onKeyDown={(e) => { if (e.key === "ArrowLeft") move(-1); if (e.key === "ArrowRight") move(1); }} aria-label="All property photos" className="fixed inset-0 m-auto h-[94dvh] max-h-none w-[96vw] max-w-7xl bg-ink p-5 text-paper backdrop:bg-ink/90">
    <div className="flex items-center justify-between gap-4 pb-4"><p className="text-sm">{title} · {active + 1} / {images.length}</p><button aria-label="Close photos" onClick={close} className="bg-bronze p-2 text-ink hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"><X /></button></div>
    <div className="relative flex h-[65dvh] items-center justify-center"><img src={images[active]} alt={`${title}, view ${active + 1}`} className="h-full w-full object-contain" />
      {images.length > 1 && <><button aria-label="Previous enlarged photo" onClick={() => move(-1)} className="absolute left-0 bg-bronze p-3 text-ink hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"><ChevronLeft /></button><button aria-label="Next enlarged photo" onClick={() => move(1)} className="absolute right-0 bg-bronze p-3 text-ink hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"><ChevronRight /></button></>}
    </div>
    <div className="mt-4 flex gap-3 overflow-x-auto">{images.map((src, i) => <button key={`${src}-${i}`} aria-label={`Open enlarged photo ${i + 1}`} aria-pressed={active === i} onClick={() => setActive(i)} className={`w-24 shrink-0 border-2 ${active === i ? "border-clay" : "border-transparent"}`}><img src={src} alt="" className="aspect-[4/3] w-full object-cover" /></button>)}</div>
  </dialog>;
}
export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  if (!images.length) return <div className="mt-8 grid aspect-[16/8] place-items-center bg-nude text-stone">Property photography not yet available.</div>;
  const move = (delta: number) => setActive((i) => (i + delta + images.length) % images.length);
  return <section aria-label="Property photography" className="mt-8">
    <div className="relative overflow-hidden bg-nude">
      <img src={images[active]} alt={`${title}, view ${active + 1}`} fetchPriority="high" className="aspect-[4/3] w-full object-cover md:aspect-[16/8]" />
      {images.length > 1 && <><button aria-label="Previous photo" onClick={() => move(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-bronze p-3 text-ink hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze md:left-5"><ChevronLeft strokeWidth={1.25} /></button><button aria-label="Next photo" onClick={() => move(1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-bronze p-3 text-ink hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze md:right-5"><ChevronRight strokeWidth={1.25} /></button></>}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 md:bottom-5 md:left-5"><span className="bg-paper/95 px-3 py-3 text-[10px] uppercase tracking-wider">{images.length} photos</span><button onClick={() => setOpen(true)} className="bg-bronze px-4 py-3 text-[10px] uppercase tracking-wider text-ink hover:bg-bronze-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze">View all photos</button></div>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">{images.slice(0, 6).map((src, i) => <button key={`${src}-${i}`} aria-label={`Show photo ${i + 1}`} aria-pressed={active === i} onClick={() => setActive(i)} className={`overflow-hidden border-2 ${active === i ? "border-clay" : "border-transparent"}`}><img src={src} alt="" loading="lazy" className="aspect-[3/2] w-full object-cover" /></button>)}</div>
    {open && <PhotoDialog images={images} title={title} start={active} close={() => setOpen(false)} />}
  </section>;
}