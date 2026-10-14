import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export const LISTING_SYNC_KEY = "chiangrai-listings-revision";
export function ListingSync() {
  const qc = useQueryClient();
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key === LISTING_SYNC_KEY)
        void qc.invalidateQueries({ queryKey: orpc.listings.key() });
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, [qc]);
  return null;
}
