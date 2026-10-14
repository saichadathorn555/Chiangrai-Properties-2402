import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useMockupStyles() {
  return useQuery(orpc.mockup.styles.queryOptions({ staleTime: Infinity }));
}
export function useGenerateMockup() {
  return useMutation(orpc.mockup.generate.mutationOptions());
}
