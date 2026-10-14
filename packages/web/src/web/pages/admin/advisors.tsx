import { useState } from "react";
import { UserRound } from "lucide-react";
import {
  useAdvisors,
  useSaveAdvisor,
  type Advisor,
} from "../../queries/advisors";
import { uploadImage } from "../../queries/upload";

export default function AdvisorDirectory() {
  const query = useAdvisors();
  const save = useSaveAdvisor();
  const [id, setId] = useState<number>();
  const [name, setName] = useState("");
  const [title, setTitle] = useState<Advisor["title"]>("Property Advisor");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function edit(a?: Advisor) {
    setId(a?.id);
    setName(a?.name ?? "");
    setTitle(a?.title ?? "Property Advisor");
    setImage(a?.image ?? "");
    setPreview(a?.imageUrl ?? "");
    setActive(a?.active ?? true);
    setError("");
  }
  return (
    <div>
      <p className="eyebrow text-clay">People & assignments</p>
      <h1 className="display mt-3 text-5xl">Advisor directory</h1>
      <p className="mt-3 max-w-2xl text-stone">
        Reusable profiles for every listing. Deactivate a profile to stop new
        assignments; existing assignments remain visible.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div className="border-t border-ink">
          {query.isPending && <p className="py-6">Loading…</p>}
          {query.isError && (
            <p role="alert" className="py-6">
              Could not load advisors.{" "}
              <button onClick={() => query.refetch()} className="underline">
                Retry
              </button>
            </p>
          )}
          {query.data?.length === 0 && (
            <p className="py-8 text-stone">
              No profiles yet. Add your first advisor.
            </p>
          )}
          {query.data?.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-4 border-b border-line py-5"
            >
              {a.imageUrl ? (
                <img
                  src={a.imageUrl}
                  alt={a.name}
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                <UserRound className="size-12 text-stone" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium break-words">{a.name}</p>
                <p className="text-sm text-stone">
                  {a.title} · {a.active ? "Active" : "Inactive"}
                </p>
              </div>
              <button className="btn-line px-4" onClick={() => edit(a)}>
                Edit
              </button>
            </div>
          ))}
        </div>
        <form
          className="min-w-0 border border-line bg-nude/25 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            try {
              await save.mutateAsync({
                id,
                data: { name, title, image, active },
              });
              edit();
            } catch (e) {
              setError(
                e instanceof Error ? e.message : "Could not save advisor",
              );
            }
          }}
        >
          <div className="flex justify-between gap-4">
            <h2 className="font-serif text-3xl">
              {id ? "Edit profile" : "New advisor"}
            </h2>
            {id && (
              <button
                type="button"
                className="text-sm underline"
                onClick={() => edit()}
              >
                New profile
              </button>
            )}
          </div>
          <label className="label mt-6" htmlFor="advisor-name">
            Name
          </label>
          <input
            aria-label="Advisor name"
            id="advisor-name"
            required
            maxLength={120}
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="label mt-5" htmlFor="advisor-title">
            Position title
          </label>
          <select
            id="advisor-title"
            className="field"
            value={title}
            onChange={(e) => setTitle(e.target.value as Advisor["title"])}
          >
            <option>Property Advisor</option>
            <option>Founder & CEO</option>
          </select>
          <label className="label mt-5" htmlFor="advisor-portrait">
            Portrait
          </label>
          {preview && (
            <img
              src={preview}
              alt="Advisor portrait preview"
              className="mb-4 size-20 rounded-full object-cover"
            />
          )}
          <input
            aria-label="Advisor portrait"
            id="advisor-portrait"
            className="max-w-full text-sm"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setBusy(true);
              setError("");
              try {
                setImage(await uploadImage(file, "listing"));
                setPreview(URL.createObjectURL(file));
              } catch (e) {
                setError(e instanceof Error ? e.message : "Upload failed");
              } finally {
                setBusy(false);
              }
            }}
          />
          <label className="mt-6 flex gap-3 text-sm">
            <input
              aria-label="Available for new assignments"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Available for new assignments
          </label>
          {error && (
            <p role="alert" className="mt-5 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            className="btn-ink mt-7 w-full"
            disabled={busy || save.isPending}
          >
            {busy ? "Uploading…" : save.isPending ? "Saving…" : "Save advisor"}
          </button>
        </form>
      </div>
    </div>
  );
}
