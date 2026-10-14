import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, client } from "../lib/api";
export type Advisor = Awaited<ReturnType<typeof client.advisors.list>>[number];
export function useAdvisors() {
  return useQuery(orpc.advisors.list.queryOptions());
}
export function useSaveAdvisor() {
  const qc = useQueryClient();
  return useMutation(
    orpc.advisors.save.mutationOptions({
      onSuccess: async () => {
        await qc.invalidateQueries({ queryKey: orpc.advisors.key() });
        await qc.invalidateQueries({ queryKey: orpc.listings.key() });
      },
    }),
  );
}
