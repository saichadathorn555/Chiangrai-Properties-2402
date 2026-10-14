import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";
import { filteredSamples, sampleListings } from "../lib/sample-listings";
import { LISTING_SYNC_KEY } from "../components/listing-sync";

export type ListingFilters = Parameters<typeof client.listings.list>[0];
export type Listing = Awaited<ReturnType<typeof client.listings.list>>[number];

export function useListings(filters: ListingFilters) {
  const q = useQuery(
    orpc.listings.list.queryOptions({
      input: filters,
      staleTime: 0,
      refetchInterval: 15_000,
      retry: import.meta.env.DEV ? false : undefined,
    }),
  );
  const samples =
    import.meta.env.DEV && !q.isLoading && q.isError
      ? filteredSamples(filters)
      : undefined;
  return {
    ...q,
    data: samples ?? q.data,
    isError: samples?.length ? false : q.isError,
    isSample: !!samples?.length,
  };
}
export function useListing(id: number) {
  const sample = import.meta.env.DEV
    ? sampleListings.find((l) => l.id === id)
    : undefined;
  const q = useQuery(
    orpc.listings.get.queryOptions({
      input: { id },
      enabled: Number.isFinite(id) && !sample,
      staleTime: 0,
      refetchInterval: 15_000,
    }),
  );
  return {
    ...q,
    data: sample
      ? {
          listing: sample,
          similar: sampleListings
            .filter((l) => l.id !== id && l.type === sample.type)
            .slice(0, 3),
        }
      : q.data,
    isLoading: sample ? false : q.isLoading,
    isSample: !!sample,
  };
}
export function useListingsMeta() {
  return useQuery(
    orpc.listings.meta.queryOptions({ staleTime: 0, refetchInterval: 15_000 }),
  );
}
export function useRawListing(id: number | null) {
  return useQuery(
    orpc.listings.raw.queryOptions({ input: { id: id ?? 0 }, enabled: !!id }),
  );
}
function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    try {
      localStorage.setItem(LISTING_SYNC_KEY, crypto.randomUUID());
    } catch {
      /* Storage may be disabled; focus/polling still refreshes. */
    }
    return qc.invalidateQueries({ queryKey: orpc.listings.key() });
  };
}
export function useCreateListing() {
  const inv = useInvalidate();
  return useMutation(orpc.listings.create.mutationOptions({ onSuccess: inv }));
}
export function useUpdateListing() {
  const inv = useInvalidate();
  return useMutation(orpc.listings.update.mutationOptions({ onSuccess: inv }));
}
export function useDeleteListing() {
  const inv = useInvalidate();
  return useMutation(orpc.listings.remove.mutationOptions({ onSuccess: inv }));
}
export function useAdminListings(
  input: Parameters<typeof client.listings.adminList>[0],
) {
  return useQuery(orpc.listings.adminList.queryOptions({ input }));
}
export function useNextRef() {
  return useQuery(orpc.listings.nextRef.queryOptions());
}
export function usePublishListing() {
  const inv = useInvalidate();
  return useMutation(orpc.listings.publish.mutationOptions({ onSuccess: inv }));
}
export function useUnpublishListing() {
  const inv = useInvalidate();
  return useMutation(
    orpc.listings.unpublish.mutationOptions({ onSuccess: inv }),
  );
}
