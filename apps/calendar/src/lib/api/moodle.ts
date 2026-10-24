import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { client, parseResponse } from "./client";
import { useSessionQuery } from "./session";

const queryKey = ["moodle-schedule"];

export function useMoodleSchedule() {
  const { data: session } = useSessionQuery();

  return useQuery({
    queryKey: [...queryKey, () => session.value?.user?.telegramId],
    enabled: () => !!session.value?.user,
    queryFn: () => parseResponse(client.api.moodle.$get()),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });
}

export function useMoodleActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey });

  return {
    connect: useMutation({
      mutationFn: (url: string) => parseResponse(client.api.moodle.$put({ json: { url } })),
      onSuccess,
    }),
    disconnect: useMutation({
      mutationFn: () => parseResponse(client.api.moodle.$delete()),
      onSuccess,
    }),
  };
}
