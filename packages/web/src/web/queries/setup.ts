import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useSetup() {
  return useQuery(orpc.setup.queryOptions());
}
