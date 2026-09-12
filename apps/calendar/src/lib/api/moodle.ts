import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { client, parseResponse } from "./client";
import { useSessionQuery } from "./session";

export function useMoodleSchedule() {
  const { data: session } = useSessionQuery();

  return useQuery({
    queryKey: ["moodle-schedule", () => session.value?.data?.user.id],
    enabled: () => !!session.value?.data,
    queryFn: () => parseResponse(client.api.user.moodle.$get()),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useMoodleActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: ["moodle-schedule"] });

  return {
    connect: useMutation({
      mutationFn: (url: string) => parseResponse(client.api.user.moodle.$post({ json: { url } })),
      onSuccess,
    }),
    disconnect: useMutation({
      mutationFn: () => parseResponse(client.api.user.moodle.$delete()),
      onSuccess,
    }),
  };
}
