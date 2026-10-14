import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  useCreateListing,
  useRawListing,
  useUpdateListing,
  useNextRef,
  usePublishListing,
} from "../../queries/listings";
import { useAdvisors } from "../../queries/advisors";
import { uploadImage } from "../../queries/upload";

const TYPES = [
  "house",
  "apartment",
  "condo",
  "retail",
  "commercial",
  "land",
] as const;
const STATUSES = ["available", "reserved", "sold", "rented"] as const;

type Img = { ref: string; preview: string };
type Room = { name: string; nameTh: string; sqm: string };
type Adv = { factor: string; detail: string };
type Agent = {
  name: string;
  title: "Property Advisor" | "Founder & CEO";
  image: string;
  preview: string;
};

type FormState = {
  ref: string;
  type: (typeof TYPES)[number];
  deal: "sale" | "rent" | "stay";
  priceDisplay: "numeric" | "on-request" | "starting-from";
  negotiable: boolean;
  advisorIds: number[];
  status: (typeof STATUSES)[number];
  title: string;
  titleTh: string;
  summary: string;
  summaryTh: string;
  description: string;
  descriptionTh: string;
  price: string;
  areaSqm: string;
  landSqm: string;
  bedrooms: string;
  bathrooms: string;
  floors: string;
  subdistrict: string;
  district: string;
  province: string;
  latitude: string;
  longitude: string;
  features: string;
  images: Img[];
  floorPlan: Img | null;
  layout: Room[];
  insiderTip: string;
  advisory: Adv[];
  ownership: string;
  featured: boolean;
  views: string;
  furnishing: string;
  agents: Agent[];
};

const empty = (): FormState => ({
  ref: "",
  type: "house",
  deal: "sale",
  priceDisplay: "numeric",
  negotiable: false,
  advisorIds: [],
  status: "available",
  title: "",
  titleTh: "",
  summary: "",
  summaryTh: "",
  description: "",
  descriptionTh: "",
  price: "",
  areaSqm: "",
  landSqm: "",
  bedrooms: "",
  bathrooms: "",
  floors: "",
  subdistrict: "",
  district: "Mueang Chiang Rai",
  province: "Chiang Rai",
  latitude: "",
  longitude: "",
  features: "",
  images: [],
  floorPlan: null,
  layout: [],
  insiderTip: "",
  advisory: [],
  ownership: "",
  featured: false,
  views: "",
  furnishing: "",
  agents: [],
});

const s = (v: number | null | undefined) => (v == null ? "" : String(v));
const num = (v: string) => (v.trim() === "" ? null : Number(v));
const int = (v: string) => (v.trim() === "" ? null : Math.round(Number(v)));

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {Children.map(children, (child) =>
        isValidElement<HTMLAttributes<HTMLElement>>(child) &&
        typeof child.type === "string" &&
        ["input", "select", "textarea"].includes(child.type)
          ? cloneElement(child, {
              "aria-label": child.props["aria-label"] ?? label,
            })
          : child,
      )}
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-8 border-t border-line py-10 md:grid-cols-[240px_1fr]">
      <div>
        <h2 className="font-serif text-2xl">{title}</h2>
        {hint && <p className="mt-2 text-sm text-stone">{hint}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export default function ListingForm({ id }: { id: number | null }) {
  const [, navigate] = useLocation();
  const raw = useRawListing(id);
  const create = useCreateListing();
  const update = useUpdateListing();
  const nextRef = useNextRef();
  const directory = useAdvisors();
  const publish = usePublishListing();
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const [revision, setRevision] = useState(1);
  const [plotUnit, setPlotUnit] = useState<"sqm" | "Rai">("sqm");
  const [f, setF] = useState<FormState>(empty);
  const [loaded, setLoaded] = useState(id == null);
  const [uploading, setUploading] = useState(0);
  const [err, setErr] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  const heroInput = useRef<HTMLInputElement>(null);
  const planInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id == null && nextRef.data)
      setF((p) => (p.ref ? p : { ...p, ref: nextRef.data.ref }));
  }, [id, nextRef.data]);
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  useEffect(() => {
    const d = raw.data;
    if (!d || loaded) return;
    setF({
      ref: d.ref,
      type: d.type,
      deal: d.deal,
      status: d.status,
      title: d.title,
      titleTh: d.titleTh ?? "",
      summary: d.summary,
      summaryTh: d.summaryTh ?? "",
      description: d.description,
      descriptionTh: d.descriptionTh ?? "",
      price: String(d.price ?? 0),
      priceDisplay: d.priceDisplay,
      negotiable: d.negotiable,
      advisorIds: d.advisorIds,
      areaSqm: s(d.areaSqm),
      landSqm: s(d.landSqm),
      bedrooms: s(d.bedrooms),
      bathrooms: s(d.bathrooms),
      floors: s(d.floors),
      subdistrict: d.subdistrict,
      district: d.district,
      province: d.province,
      latitude: s(d.latitude),
      longitude: s(d.longitude),
      features: d.features.join("\n"),
      images: d.imageRefs.map((ref, i) => ({ ref, preview: d.imageUrls[i]! })),
      floorPlan:
        d.floorPlanImage && d.floorPlanUrl
          ? { ref: d.floorPlanImage, preview: d.floorPlanUrl }
          : null,
      layout: d.layout.map((r) => ({
        name: r.name,
        nameTh: r.nameTh ?? "",
        sqm: String(r.sqm),
      })),
      insiderTip: d.insiderTip ?? "",
      advisory: d.advisory,
      ownership: d.ownership ?? "",
      featured: d.featured,
      views: d.views ?? "",
      furnishing: d.furnishing ?? "",
      agents: d.agents.map((a, i) => ({
        ...a,
        preview: d.advisorProfiles[i]?.imageUrl ?? "",
      })),
    });
    setLoaded(true);
    setRevision(d.revision);
  }, [raw.data, loaded]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setDirty(true);
    setNotice("");
    setF((p) => ({ ...p, [k]: v }));
  };
  const text = (k: keyof FormState) => ({
    value: f[k] as string,
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => set(k, e.target.value as never),
  });

  async function addFiles(
    files: FileList | null,
    target: "hero" | "photos" | "plan",
  ) {
    if (!files?.length) return;
    setErr("");
    const list = Array.from(files).filter((x) =>
      /^image\/(png|jpe?g|webp)$/.test(x.type),
    );
    if (list.length !== files.length) {
      setErr("Choose JPG, PNG or WebP images only.");
      return;
    }
    if (target !== "plan" && f.images.length + list.length > 40) {
      setErr(
        "Maximum 40 listing photographs. Remove an image before adding more.",
      );
      return;
    }
    if (list.some((x) => x.size > 20 * 1024 * 1024)) {
      setErr("Images must be smaller than 20 MB.");
      return;
    }
    setDirty(true);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const ref = await uploadImage(file, "listing");
        const img = { ref, preview: URL.createObjectURL(file) };
        if (target === "plan") set("floorPlan", img);
        else if (target === "hero")
          setF((p) => ({ ...p, images: [img, ...p.images] }));
        else setF((p) => ({ ...p, images: [...p.images, img] }));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  function moveImage(i: number, dir: -1 | 1) {
    setDirty(true);
    setF((p) => {
      const imgs = [...p.images];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return p;
      [imgs[i], imgs[j]] = [imgs[j]!, imgs[i]!];
      return { ...p, images: imgs };
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!!f.latitude.trim() !== !!f.longitude.trim()) {
      setErr(
        "Provide both latitude and longitude, or leave both empty for an approximate district map.",
      );
      return;
    }
    const data = {
      ref: f.ref.trim(),
      type: f.type,
      deal: f.deal,
      priceDisplay: f.priceDisplay,
      negotiable: f.negotiable,
      advisorIds: f.advisorIds,
      status: f.status,
      title: f.title.trim(),
      titleTh: f.titleTh.trim() || null,
      summary: f.summary,
      summaryTh: f.summaryTh.trim() || null,
      description: f.description,
      descriptionTh: f.descriptionTh.trim() || null,
      price: Math.round(Number(f.price) || 0),
      areaSqm: num(f.areaSqm),
      landSqm: num(f.landSqm),
      bedrooms: int(f.bedrooms),
      bathrooms: int(f.bathrooms),
      floors: int(f.floors),
      subdistrict: f.subdistrict,
      district: f.district.trim(),
      province: f.province || "Chiang Rai",
      latitude: num(f.latitude),
      longitude: num(f.longitude),
      features: f.features
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      images: f.images.map((i) => i.ref),
      floorPlanImage: f.floorPlan?.ref ?? null,
      layout: f.layout
        .filter((r) => r.name.trim())
        .map((r) => ({
          name: r.name.trim(),
          nameTh: r.nameTh.trim() || undefined,
          sqm: Number(r.sqm) || 0,
        })),
      insiderTip: f.insiderTip.trim() || null,
      advisory: f.advisory.filter((a) => a.factor.trim()),
      ownership: f.ownership.trim() || null,
      featured: f.featured,
      views: f.views.trim() || null,
      furnishing: f.furnishing.trim() || null,
      agents: f.agents.map(({ name, title, image }) => ({
        name: name.trim(),
        title,
        image,
      })),
    };
    try {
      const row =
        id == null
          ? await create.mutateAsync(data)
          : await update.mutateAsync({ id, revision, data });
      setRevision(row.revision);
      setDirty(false);
      setNotice(
        "Draft saved. Preview the property, then Publish when ready. Not visible in website search.",
      );
      if (id == null) navigate(`/listings/${row.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    }
  }

  if (!loaded) {
    return (
      <div className="py-20 text-center text-stone">
        {raw.isError ? "Listing not found." : "Loading…"}
      </div>
    );
  }

  const busy = create.isPending || update.isPending || publish.isPending;

  return (
    <form onSubmit={save}>
      <fieldset disabled={busy || uploading > 0} className="min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
          <div>
            <Link to="/" className="eyebrow text-stone hover:text-ink">
              ← All listings
            </Link>
            <h1 className="display mt-3 text-5xl">
              {id == null ? "New listing" : f.title || "Edit listing"}
            </h1>
            <p className="mt-3 text-sm text-stone">
              {dirty
                ? "Unsaved changes"
                : raw.data?.publication === "published"
                  ? "Published · PDF ready"
                  : "Draft · Hidden from website search"}
              {id != null ? ` · Revision ${revision}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {id != null && (
              <a
                href={`/property/${id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-line"
              >
                Preview
              </a>
            )}
            <button className="btn-ink" disabled={busy || uploading > 0}>
              {create.isPending || update.isPending
                ? "Saving…"
                : uploading > 0
                  ? "Uploading…"
                  : "Save Draft"}
            </button>
            {id != null && (
              <button
                type="button"
                className="btn-line"
                disabled={
                  busy ||
                  dirty ||
                  uploading > 0 ||
                  raw.data?.publication === "published"
                }
                onClick={async () => {
                  setErr("");
                  setNotice("");
                  try {
                    await publish.mutateAsync({ id, revision });
                    setNotice(
                      "Published. Website search, property page and stored PDF are synchronized.",
                    );
                  } catch (e) {
                    setErr(
                      e instanceof Error
                        ? e.message
                        : "Publication failed. Your draft is retained.",
                    );
                  }
                }}
              >
                {publish.isPending ? "Generating PDF & publishing…" : "Publish"}
              </button>
            )}
          </div>
        </div>
        <p className="mb-6 border-y border-line py-4 text-sm text-stone">
          Save Draft → Preview → Publish. Saving edits to a published listing
          withdraws it until republished. Publish validates supplied images and
          creates the four-page PDF; no site launch is triggered.
        </p>
        {notice && (
          <output className="mb-6 block border border-clay bg-peach/20 p-4 text-sm">
            {notice}
          </output>
        )}
        {err && (
          <p
            role="alert"
            className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {err}
          </p>
        )}

        <Section
          title="Basics"
          hint="Type, deal and status drive the filters on the public site."
        >
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Property Ref Code">
              <input
                aria-label="Property Ref Code"
                className="field"
                required
                {...text("ref")}
              />
              <button
                type="button"
                className="mt-2 text-xs underline"
                onClick={async () => {
                  const result = await nextRef.refetch();
                  if (result.data) set("ref", result.data.ref);
                }}
              >
                Generate next reference
              </button>
            </Field>
            <Field label="Property Type">
              <select className="field" {...text("type")}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === "commercial"
                      ? "Commercial Space"
                      : t === "apartment"
                        ? "Apartment (existing category)"
                        : t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Transaction Type">
              <select className="field" {...text("deal")}>
                <option value="sale">Buy</option>
                <option value="rent">Rent</option>
                <option value="stay">Stay</option>
              </select>
            </Field>
            <Field label="Status">
              <select className="field" {...text("status")}>
                {STATUSES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title (English)">
              <input className="field" required {...text("title")} />
            </Field>
            <Field label="Title (Thai)">
              <input className="field" {...text("titleTh")} />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Short description (English)">
              <textarea className="field min-h-24" {...text("summary")} />
            </Field>
            <Field label="Short description (Thai)">
              <textarea className="field min-h-24" {...text("summaryTh")} />
            </Field>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={f.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="size-4 accent-ink"
              aria-label="Featured"
            />
            Feature on the home page
          </label>
        </Section>

        <Section
          title="Price & size"
          hint="All sizes stored in sqm. Rent is per month; Stay is per night. Price flags apply to website and PDF."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label={
                f.deal === "rent"
                  ? "Rent (THB / month)"
                  : f.deal === "stay"
                    ? "Stay (THB / night)"
                    : "Price (THB)"
              }
            >
              <input
                aria-label="Price in THB"
                className="field"
                type="number"
                min={0}
                required={f.priceDisplay !== "on-request"}
                {...text("price")}
              />
            </Field>
            <Field label="Interior / usable area (sqm)">
              <input
                className="field"
                type="number"
                step="any"
                min={0}
                {...text("areaSqm")}
              />
            </Field>
            <Field label="Plot area">
              <div className="flex gap-2">
                <input
                  aria-label="Plot area"
                  className="field min-w-0"
                  type="number"
                  step="any"
                  min={0}
                  value={
                    f.landSqm === ""
                      ? ""
                      : String(
                          Number(f.landSqm) / (plotUnit === "Rai" ? 1600 : 1),
                        )
                  }
                  onChange={(e) =>
                    set(
                      "landSqm",
                      e.target.value === ""
                        ? ""
                        : String(
                            Number(e.target.value) *
                              (plotUnit === "Rai" ? 1600 : 1),
                          ),
                    )
                  }
                />
                <select
                  aria-label="Plot area unit"
                  className="field w-24 shrink-0"
                  style={{ width: "6rem" }}
                  value={plotUnit}
                  onChange={(e) =>
                    setPlotUnit(e.target.value as typeof plotUnit)
                  }
                >
                  <option>sqm</option>
                  <option>Rai</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-stone">
                1 Rai = 1,600 sqm. Stored in sqm.
              </p>
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price display">
              <select
                aria-label="Price display"
                className="field"
                {...text("priceDisplay")}
              >
                <option value="numeric">Show numeric THB price</option>
                <option value="on-request">
                  Price on request — hide numeric price
                </option>
                <option value="starting-from">Starting from</option>
              </select>
            </Field>
            <label className="flex items-center gap-3 text-sm">
              <input
                aria-label="Negotiable label"
                type="checkbox"
                checked={f.negotiable}
                onChange={(e) => set("negotiable", e.target.checked)}
              />
              Negotiable label
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Bedrooms">
              <input
                className="field"
                type="number"
                min={0}
                {...text("bedrooms")}
              />
            </Field>
            <Field label="Bathrooms">
              <input
                className="field"
                type="number"
                min={0}
                {...text("bathrooms")}
              />
            </Field>
            <Field label="Floors">
              <input
                className="field"
                type="number"
                min={0}
                {...text("floors")}
              />
            </Field>
          </div>
          <Field label="Legal note (small print at the foot of the listing)">
            <textarea
              className="field min-h-20"
              placeholder="e.g. Not legal or financial advice…"
              {...text("ownership")}
            />
          </Field>
        </Section>

        <Section
          title="Location"
          hint="Optional coordinates position the map pin. Leave both blank to show an approximate district map. Publish only coordinates you have permission to share."
        >
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Subdistrict / area">
              <input className="field" {...text("subdistrict")} />
            </Field>
            <Field label="District">
              <input className="field" required {...text("district")} />
            </Field>
            <Field label="City">
              <input
                aria-label="City"
                className="field"
                {...text("province")}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Latitude">
              <input
                aria-label="Latitude"
                className="field"
                type="number"
                step="any"
                min={-90}
                max={90}
                {...text("latitude")}
              />
            </Field>
            <Field label="Longitude">
              <input
                aria-label="Longitude"
                className="field"
                type="number"
                step="any"
                min={-180}
                max={180}
                {...text("longitude")}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Key information & advisors"
          hint="Select reusable directory profiles, in primary/co-advisor order. Unassigned listings retain the founder profile."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Views">
              <input aria-label="Views" className="field" {...text("views")} />
            </Field>
            <Field label="Furnishing status">
              <input
                aria-label="Furnishing status"
                className="field"
                {...text("furnishing")}
              />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[0, 1].map((index) => (
              <Field
                key={index}
                label={index === 0 ? "Primary advisor" : "Co-advisor"}
              >
                <select
                  className="field"
                  aria-label={index === 0 ? "Primary advisor" : "Co-advisor"}
                  value={f.advisorIds[index] ?? ""}
                  onChange={(e) => {
                    const ids = [...f.advisorIds];
                    if (e.target.value) ids[index] = Number(e.target.value);
                    else ids.splice(index, 1);
                    set("advisorIds", ids.filter(Boolean));
                  }}
                >
                  <option value="">
                    {index === 0 ? "Default founder / No assignment" : "None"}
                  </option>
                  {directory.data
                    ?.filter(
                      (a) =>
                        (a.active || f.advisorIds.includes(a.id)) &&
                        !f.advisorIds.some(
                          (id, i) => i !== index && id === a.id,
                        ),
                    )
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {a.title}
                        {!a.active ? " (inactive)" : ""}
                      </option>
                    ))}
                </select>
              </Field>
            ))}
          </div>
          <Link
            to="/advisors"
            className="text-sm underline decoration-clay underline-offset-4"
          >
            Manage advisor directory →
          </Link>
          {f.agents.length > 0 && !f.advisorIds.length && (
            <p className="text-xs text-stone">
              This listing has a legacy custom advisor. Select directory
              profiles to replace it.
            </p>
          )}
          {f.agents.length > 0 &&
            !f.advisorIds.length &&
            f.agents.map((agent, i) => (
              <div key={i} className="space-y-4 border border-line p-5">
                <p className="eyebrow">
                  {i === 0 ? "Primary advisor" : "Co-advisor"}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    aria-label={`Advisor ${i + 1} name`}
                    placeholder="Advisor name"
                    required
                    className="field"
                    value={agent.name}
                    onChange={(e) =>
                      set(
                        "agents",
                        f.agents.map((a, j) =>
                          j === i ? { ...a, name: e.target.value } : a,
                        ),
                      )
                    }
                  />
                  <select
                    aria-label={`Advisor ${i + 1} title`}
                    className="field"
                    value={agent.title}
                    onChange={(e) =>
                      set(
                        "agents",
                        f.agents.map((a, j) =>
                          j === i
                            ? { ...a, title: e.target.value as Agent["title"] }
                            : a,
                        ),
                      )
                    }
                  >
                    <option>Property Advisor</option>
                    <option>Founder & CEO</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {agent.preview && (
                    <img
                      src={agent.preview}
                      alt={agent.name}
                      className="size-16 rounded-full object-cover"
                    />
                  )}
                  <input
                    aria-label={`Advisor ${i + 1} portrait`}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading((n) => n + 1);
                      try {
                        const ref = await uploadImage(file, "listing");
                        setF((p) => ({
                          ...p,
                          agents: p.agents.map((a, j) =>
                            j === i
                              ? {
                                  ...a,
                                  image: ref,
                                  preview: URL.createObjectURL(file),
                                }
                              : a,
                          ),
                        }));
                      } catch (error) {
                        setErr(
                          error instanceof Error
                            ? error.message
                            : "Portrait upload failed",
                        );
                      } finally {
                        setUploading((n) => n - 1);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="text-sm text-red-700"
                    onClick={() =>
                      set(
                        "agents",
                        f.agents.filter((_, j) => i !== j),
                      )
                    }
                  >
                    Remove advisor
                  </button>
                </div>
              </div>
            ))}
        </Section>

        <Section
          title="Photos"
          hint="First photo is the cover. JPG, PNG or WebP."
        >
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="btn-line"
              disabled={uploading > 0}
              onClick={() => heroInput.current?.click()}
            >
              Upload hero image
            </button>
            <p className="text-xs text-stone">
              New hero goes first; previous images remain in the gallery. Up to
              40 photos, 20 MB each. PDF uses the first 12.
            </p>
          </div>
          <input
            ref={heroInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            aria-label="Upload hero image"
            onChange={(e) => {
              addFiles(e.target.files, "hero");
              e.target.value = "";
            }}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {f.images.map((img, i) => (
              <div
                key={img.ref}
                className="group relative aspect-[4/3] bg-nude"
              >
                <img
                  src={img.preview}
                  alt=""
                  className="size-full object-cover"
                />
                {i === 0 && (
                  <span className="eyebrow absolute top-2 left-2 bg-paper px-2 py-1 text-[9px]">
                    Cover
                  </span>
                )}
                <div className="absolute right-2 bottom-2 flex gap-1">
                  {i > 0 && (
                    <button
                      type="button"
                      className="bg-paper p-1.5 text-xs"
                      aria-label={`Make image ${i + 1} hero`}
                      onClick={() =>
                        set("images", [
                          img,
                          ...f.images.filter((_, j) => j !== i),
                        ])
                      }
                    >
                      Hero
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    className="bg-paper p-1.5"
                    aria-label="Move left"
                  >
                    <ArrowUp className="size-3.5 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    className="bg-paper p-1.5"
                    aria-label="Move right"
                  >
                    <ArrowDown className="size-3.5 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "images",
                        f.images.filter((_, j) => j !== i),
                      )
                    }
                    className="bg-paper p-1.5 text-red-700"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 border border-dashed border-sand text-stone hover:border-ink hover:text-ink"
            >
              {uploading > 0 ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Upload className="size-5" strokeWidth={1.25} />
              )}
              <span className="eyebrow">Add photos</span>
            </button>
          </div>
          <input
            ref={photoInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            hidden
            aria-label="Upload photos"
            onChange={(e) => {
              addFiles(e.target.files, "photos");
              e.target.value = "";
            }}
          />
        </Section>

        <Section
          title="Layout & floor plan"
          hint="Room-by-room areas in sqm, shown as a table on the listing, plus an optional floor plan image."
        >
          <div className="space-y-3">
            {f.layout.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_110px_auto] gap-3"
              >
                <input
                  className="field"
                  placeholder="Room / zone"
                  aria-label="Room name"
                  value={r.name}
                  onChange={(e) =>
                    set(
                      "layout",
                      f.layout.map((x, j) =>
                        j === i ? { ...x, name: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  className="field"
                  placeholder="Thai name (optional)"
                  aria-label="Room name (Thai)"
                  value={r.nameTh}
                  onChange={(e) =>
                    set(
                      "layout",
                      f.layout.map((x, j) =>
                        j === i ? { ...x, nameTh: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  className="field"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="sqm"
                  aria-label="Room area sqm"
                  value={r.sqm}
                  onChange={(e) =>
                    set(
                      "layout",
                      f.layout.map((x, j) =>
                        j === i ? { ...x, sqm: e.target.value } : x,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="px-2 text-stone hover:text-red-700"
                  onClick={() =>
                    set(
                      "layout",
                      f.layout.filter((_, j) => j !== i),
                    )
                  }
                  aria-label="Remove row"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                set("layout", [...f.layout, { name: "", nameTh: "", sqm: "" }])
              }
            >
              <Plus className="size-3.5" /> Add room
            </button>
            {f.layout.length > 0 && (
              <p className="text-sm text-stone">
                Total:{" "}
                {f.layout
                  .reduce((a, r) => a + (Number(r.sqm) || 0), 0)
                  .toLocaleString()}{" "}
                sqm
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-start gap-5">
            <div className="flex aspect-[4/3] w-64 items-center justify-center bg-nude">
              {f.floorPlan ? (
                <img
                  src={f.floorPlan.preview}
                  alt="Floor plan"
                  className="size-full object-contain"
                />
              ) : (
                <span className="text-sm text-stone">No floor plan</span>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="btn-line"
                onClick={() => planInput.current?.click()}
              >
                <Upload className="size-3.5" />{" "}
                {f.floorPlan ? "Replace" : "Upload"} floor plan
              </button>
              {f.floorPlan && (
                <button
                  type="button"
                  className="eyebrow text-left text-red-700"
                  onClick={() => set("floorPlan", null)}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={planInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              aria-label="Upload floor plan"
              onChange={(e) => {
                addFiles(e.target.files, "plan");
                e.target.value = "";
              }}
            />
          </div>
        </Section>

        <Section
          title="Description"
          hint={`Supports "## Heading" lines. The four-page brochure accepts a title up to 160 characters, short description up to 700 and full description up to 3,800; layout is also checked at Publish.`}
        >
          <Field label="Full description (English)">
            <textarea
              className="field min-h-72 font-mono text-[13px]"
              {...text("description")}
            />
          </Field>
          <Field label="Full description (Thai)">
            <textarea
              className="field min-h-40 font-mono text-[13px]"
              {...text("descriptionTh")}
            />
          </Field>
          <Field label="Features — one per line">
            <textarea
              className="field min-h-40"
              placeholder={"Mountain view\nPrivate garden\nCovered parking"}
              {...text("features")}
            />
          </Field>
        </Section>

        <Section
          title="Advisory"
          hint="The insider tip and the advisory snapshot table shown on the listing."
        >
          <Field label="Insider tip">
            <textarea className="field min-h-24" {...text("insiderTip")} />
          </Field>
          <div className="space-y-3">
            <span className="label">Advisory snapshot</span>
            {f.advisory.map((a, i) => (
              <div key={i} className="grid grid-cols-[200px_1fr_auto] gap-3">
                <input
                  className="field"
                  placeholder="Factor"
                  aria-label="Advisory factor"
                  value={a.factor}
                  onChange={(e) =>
                    set(
                      "advisory",
                      f.advisory.map((x, j) =>
                        j === i ? { ...x, factor: e.target.value } : x,
                      ),
                    )
                  }
                />
                <input
                  className="field"
                  placeholder="Detail"
                  aria-label="Advisory detail"
                  value={a.detail}
                  onChange={(e) =>
                    set(
                      "advisory",
                      f.advisory.map((x, j) =>
                        j === i ? { ...x, detail: e.target.value } : x,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="px-2 text-stone hover:text-red-700"
                  onClick={() =>
                    set(
                      "advisory",
                      f.advisory.filter((_, j) => j !== i),
                    )
                  }
                  aria-label="Remove row"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                set("advisory", [...f.advisory, { factor: "", detail: "" }])
              }
            >
              <Plus className="size-3.5" /> Add row
            </button>
          </div>
        </Section>

        <div className="flex justify-end border-t border-line pt-8">
          <button className="btn-ink" disabled={busy || uploading > 0}>
            {create.isPending || update.isPending ? "Saving…" : "Save Draft"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
