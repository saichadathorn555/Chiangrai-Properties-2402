import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useSubmitInquiry() {
  return useMutation(orpc.inquiries.submit.mutationOptions());
}
export function useInquiries() {
  return useQuery(orpc.inquiries.list.queryOptions());
}
export function useSetInquiryStatus() {
  const qc = useQueryClient();
  return useMutation(
    orpc.inquiries.setStatus.mutationOptions({
      onSuccess: () => qc.invalidateQueries({ queryKey: orpc.inquiries.key() }),
    }),
  );
}
export function useDeleteInquiry() {
  const qc = useQueryClient();
  return useMutation(
    orpc.inquiries.remove.mutationOptions({
      onSuccess: () => qc.invalidateQueries({ queryKey: orpc.inquiries.key() }),
    }),
  );
}
