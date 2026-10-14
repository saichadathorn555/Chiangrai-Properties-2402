import { useMutation } from "@tanstack/react-query";
import { orpc } from "../lib/api";

export function useSubscribe() {
  return useMutation(orpc.newsletter.subscribe.mutationOptions());
}