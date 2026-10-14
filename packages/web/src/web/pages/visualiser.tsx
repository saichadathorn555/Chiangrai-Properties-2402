import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import { ImagePlus, Loader2, Sparkles, ExternalLink, RotateCcw } from "lucide-react";
import { useT } from "../i18n/context";
import { uploadImage } from "../queries/upload";
import { useListings } from "../queries/listings";
import { useGenerateMockup, useMockupStyles } from "../queries/mockup";

type Source = { ref: string; preview: string; listingId?: number };

export default function VisualiserPage() {
  const { t } = useT();
  const search = useSearch();
  const listingParam = Number(new URLSearchParams(search).get("listing")) || undefined;
  const listings = useListings({ limit: 60, sort: "newest" });
  const styles = useMockupStyles();
  const gen = useGenerateMockup();
  const fileRef = useRef<HTMLInputElement>(null);

  const [source, setSource] = useState<Source | null>(null);
  const [uploading, setUploading] = useState(false);
  const [space, setSpace] = useState(t.visual.spaces[0]!);
  const [style, setStyle] = useState("Minimal Japandi");
  const [notes, setNotes] = useState("");
  const [mode, setMode] = useState<"restyle" | "imagine">("restyle");
  const [err, setErr] = useState<string | null>(null);

  const pickable = useMemo(() => {
    const all = listings.data ?? [];
    const first = listingParam ? all.filter((l) => l.id === listingParam) : [];
    const rest = all.filter((l) => l.id !== listingParam && l.type !== "land");
    const seen = new Set<string>();
    return [...first, ...rest]
      .flatMap((l) => l.imageUrls.map((u, i) => ({ url: u, ref: l.imageRefs[i]!, l })))
      .filter((p) => (seen.has(p.ref) ? false : (seen.add(p.ref), true)));
  }, [listings.data, listingParam]);

  // preselect first photo of the linked listing
  useEffect(() => {
    if (!source && listingParam && pickable[0]?.l.id === listingParam) {
      const p = pickable[0];
      setSource({ ref: p.ref, preview: p.url, listingId: p.l.id });
    }
  }, [pickable, listingParam, source]);

  async function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return setErr("Max 10 MB");
    setErr(null);
    setUploading(true);
    try {
      const ref = await uploadImage(f, "customer");
      setSource({ ref, preview: URL.createObjectURL(f) });
      setMode("restyle");
    } catch {
      setErr(t.form.error);
    } finally {
      setUploading(false);
    }
  }

  function generate() {
    setErr(null);
    if (mode === "restyle" && !source) return setErr(t.visual.needPhoto);
    gen.mutate(
      {
        sourceRef: mode === "restyle" ? source?.ref : undefined,
        listingId: source?.listingId,
        space,
        style,
        notes,
        mode,
      },
      { onError: (e) => setErr(e.message || t.form.error) },
    );
  }

  return (
    <div className="wrap pt-14">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="eyebrow reveal d1 text-clay">{t.visual.eyebrow}</p>
          <h1 className="display translated-heading reveal d2 mt-4 [--heading-size:52px] md:[--heading-size:84px]">{t.visual.title}</h1>
        </div>
        <p className="reveal d3 self-end text-[17px] text-stone md:col-span-5">{t.visual.intro}</p>
      </div>

      <div className="mt-16 grid gap-12 border-t border-line pt-12 lg:grid-cols-12">
        {/* Controls */}
        <div className="space-y-10 lg:col-span-5">
          <div>
            <p className="eyebrow"><span className="text-clay">01</span> — {t.visual.step1}</p>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-5 flex w-full items-center gap-4 border border-dashed border-sand bg-nude/40 p-6 text-left transition-colors hover:border-ink"
            >
              {uploading ? <Loader2 className="size-6 animate-spin text-clay" /> : <ImagePlus className="size-6 text-clay" strokeWidth={1.25} />}
              <div>
                <p className="font-medium">{t.visual.upload}</p>
                <p className="text-[13px] text-stone">{t.visual.uploadHint}</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden aria-label="Upload photo" onChange={(e) => onFile(e.target.files?.[0])} />

            <p className="eyebrow mt-6 text-stone">{t.visual.orPick}</p>
            <div className="mt-3 grid max-h-64 grid-cols-4 gap-2 overflow-y-auto pr-1">
              {listings.isLoading && Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square animate-pulse bg-nude" />)}
              {pickable.map(({ url, ref, l }) => {
                const active = source?.preview === url;
                return (
                  <button
                    key={url + l.id}
                    title={l.title}
                    aria-label={l.title}
                    onClick={() => setSource({ ref, preview: url, listingId: l.id })}
                    className={`relative aspect-square overflow-hidden ${active ? "ring-2 ring-ink ring-offset-2 ring-offset-paper" : "opacity-80 hover:opacity-100"}`}
                  >
                    <img src={url} alt="" loading="lazy" className="size-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="eyebrow"><span className="text-clay">02</span> — {t.visual.step2}</p>
            <div className="mt-5 grid grid-cols-2 border border-line">
              {(["restyle", "imagine"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`eyebrow py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze ${mode === m ? "bg-bronze text-ink" : "text-stone hover:text-ink"}`}>
                  {m === "restyle" ? t.visual.restyle : t.visual.imagine}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="label">{t.visual.space}</label>
                <select value={space} onChange={(e) => setSpace(e.target.value)} className="field">
                  {t.visual.spaces.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">{t.visual.style}</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)} className="field">
                  {(styles.data ?? ["Minimal Japandi"]).map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className="label">{t.visual.notes}</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={t.visual.notesPh} aria-label={t.visual.notesPh} className="field resize-none" />
            </div>
          </div>

          {err && <p className="text-sm text-red-700">{err}</p>}
          <button onClick={generate} disabled={gen.isPending || uploading} className="btn-ink w-full">
            {gen.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {gen.isPending ? t.visual.generating : t.visual.generate}
          </button>
          <p className="text-[12px] text-stone">{t.visual.disclaimer}</p>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-7">
          <div className="grid gap-3 md:grid-cols-2">
            <figure>
              <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-nude">
                {source && mode === "restyle" ? (
                  <img src={source.preview} alt="" className="size-full object-cover" />
                ) : (
                  <span className="eyebrow text-stone">{mode === "imagine" ? t.visual.imagine : t.visual.step1}</span>
                )}
              </div>
              <figcaption className="eyebrow mt-3 text-stone">{t.visual.before}</figcaption>
            </figure>
            <figure>
              <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-peach/40">
                {gen.isPending ? (
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <Loader2 className="size-8 animate-spin text-clay" strokeWidth={1.25} />
                    <p className="text-[13px] text-stone">{t.visual.generating}</p>
                  </div>
                ) : gen.data ? (
                  <img src={gen.data.url} alt="AI visual" className="reveal size-full object-cover" />
                ) : (
                  <Sparkles className="size-10 text-clay/50" strokeWidth={1} />
                )}
              </div>
              <figcaption className="eyebrow mt-3 flex justify-between text-clay">
                <span>{t.visual.after}{gen.data ? ` · ${style}` : ""}</span>
                {gen.data && (
                  <a href={gen.data.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-stone hover:text-ink">
                    {t.visual.download} <ExternalLink className="size-3" />
                  </a>
                )}
              </figcaption>
            </figure>
          </div>

          {gen.data && (
            <div className="mt-10 flex flex-col items-start justify-between gap-6 bg-nude/60 p-8 md:flex-row md:items-center">
              <p className="font-serif text-[24px]">{t.visual.help}</p>
              <div className="flex gap-3">
                <button onClick={() => gen.reset()} className="btn-line"><RotateCcw className="size-3.5" />{t.visual.again}</button>
                <Link to="/consultancy#book" className="btn-ink">{t.visual.helpCta}</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
