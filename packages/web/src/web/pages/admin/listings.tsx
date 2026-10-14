import { useState } from "react";
import { Link } from "wouter";
import {
  useAdminListings,
  useUnpublishListing,
  useDeleteListing,
} from "../../queries/listings";
import { propertyPrice } from "../../lib/property-summary";

export default function AdminListings() {
  const [q, setQ] = useState("");
  const [publication, setPublication] = useState<"draft" | "published" | "">(
    "",
  );
  const [deal, setDeal] = useState<"sale" | "rent" | "stay" | "">("");
  const all = useAdminListings({});
  const result = useAdminListings({
    q,
    publication: publication || undefined,
    deal: deal || undefined,
  });
  const withdraw = useUnpublishListing();
  const del = useDeleteListing();
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow text-clay">Back-office / Property portfolio</p>
          <h1 className="display mt-3 text-5xl">Listing management</h1>
          <p className="mt-3 text-stone">
            Create once. Publish to search, property pages and the four-page
            brochure.
          </p>
        </div>
        <Link to="/listings/new" className="btn-ink">
          + New listing
        </Link>
      </div>
      <div className="mt-9 grid grid-cols-3 border-y border-line bg-nude/25">
        {[
          ["All listings", all.data?.length],
          ["Draft", all.data?.filter((l) => l.publication === "draft").length],
          [
            "Published",
            all.data?.filter((l) => l.publication === "published").length,
          ],
        ].map(([label, count]) => (
          <div
            key={label}
            className="border-r border-line p-4 last:border-r-0 md:p-6"
          >
            <p className="text-xs text-stone">{label}</p>
            <p className="mt-2 font-serif text-4xl">{count ?? "—"}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-stone">
        Published means ready for the website. The public Coming Soon page
        remains in place until the site is launched.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
        <input
          className="field"
          aria-label="Search listings"
          placeholder="Search title or reference…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="field"
          aria-label="Publication filter"
          value={publication}
          onChange={(e) => setPublication(e.target.value as typeof publication)}
        >
          <option value="">All publication states</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <select
          className="field"
          aria-label="Transaction filter"
          value={deal}
          onChange={(e) => setDeal(e.target.value as typeof deal)}
        >
          <option value="">All transactions</option>
          <option value="sale">Buy</option>
          <option value="rent">Rent</option>
          <option value="stay">Stay</option>
        </select>
      </div>
      {(withdraw.error || del.error) && (
        <p role="alert" className="mt-5 text-red-700">
          {withdraw.error?.message || del.error?.message}
        </p>
      )}
      <div className="mt-7 overflow-x-auto border-t border-ink">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead>
            <tr className="eyebrow border-b border-line text-stone">
              {[
                "Property",
                "Transaction",
                "Price",
                "Publication",
                "Actions",
              ].map((c) => (
                <th key={c} className="py-4 pr-4 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.isPending && (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  Loading portfolio…
                </td>
              </tr>
            )}
            {result.isError && (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  Could not load listings.{" "}
                  <button
                    className="underline"
                    onClick={() => result.refetch()}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            )}
            {result.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="py-16 text-center text-stone">
                  No listings found. Create a new listing or clear your filters.
                </td>
              </tr>
            )}
            {result.data?.map((l) => (
              <tr key={l.id} className="border-b border-line">
                <td className="py-5 pr-5" aria-label={l.title}>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-20 shrink-0 bg-nude">
                      {l.imageUrls[0] && (
                        <img
                          src={l.imageUrls[0]}
                          alt=""
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/listings/${l.id}`}
                        className="font-medium hover:text-clay"
                      >
                        {l.title}
                      </Link>
                      <p className="mt-1 text-xs text-stone">
                        {l.ref} · {l.district} · {l.status}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="pr-4">
                  {l.deal === "sale"
                    ? "Buy"
                    : l.deal === "stay"
                      ? "Stay"
                      : "Rent"}
                  <p className="text-xs text-stone capitalize">{l.type}</p>
                </td>
                <td className="max-w-48 pr-4">{propertyPrice(l)}</td>
                <td className="pr-4">
                  <span
                    className={`border px-2 py-1 text-xs ${l.publication === "published" ? "border-clay bg-peach/30" : "border-line bg-nude"}`}
                  >
                    {l.publication === "published" ? "Published" : "Draft"}
                  </span>
                  <p className="mt-2 text-xs text-stone">
                    Revision {l.revision}
                    {l.brochureUrl ? " · PDF ready" : " · Not in search"}
                  </p>
                </td>
                <td className="whitespace-nowrap">
                  <Link
                    to={`/listings/${l.id}`}
                    className="mr-4 text-xs underline underline-offset-4"
                  >
                    Edit
                  </Link>
                  <a
                    href={`/property/${l.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mr-4 text-xs underline underline-offset-4"
                  >
                    Preview
                  </a>
                  {l.publication === "published" ? (
                    <button
                      disabled={withdraw.isPending}
                      className="text-xs text-clay"
                      onClick={() => {
                        if (confirm(`Withdraw ${l.ref} from website search?`))
                          withdraw.mutate({ id: l.id, revision: l.revision });
                      }}
                    >
                      Withdraw
                    </button>
                  ) : (
                    <button
                      disabled={del.isPending}
                      className="text-xs text-red-700"
                      onClick={() => {
                        if (
                          confirm(
                            `Delete draft ${l.ref}? This cannot be undone.`,
                          )
                        )
                          del.mutate({ id: l.id });
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
