import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { client, parseResponse } from "./client";
import { useSessionQuery } from "./session";

export function useMyDuSchedule() {
  const { data: session } = useSessionQuery();

  return useQuery({
    queryKey: ["my-du-schedule", () => session.value?.data?.user.id],
    enabled: () => !!session.value?.data,
    queryFn: () => parseResponse(client.api.user.schedule.$get()),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useMyDuActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["my-du-schedule"] });

  const start = useMutation({
    mutationFn: () => parseResponse(client.api.user["my-du"].start.$post()),
  });

  const connect = useMutation({
    mutationFn: (json: MyDuConnectionInput) =>
      parseResponse(client.api.user["my-du"].connect.$post({ json })),
    onSuccess: invalidate,
  });

  const sync = useMutation({
    mutationFn: () => parseResponse(client.api.user["my-du"].sync.$post()),
    onSuccess: invalidate,
  });

  const disconnect = useMutation({
    mutationFn: () => parseResponse(client.api.user["my-du"].$delete()),
    onSuccess: invalidate,
  });

  return { start, connect, sync, disconnect };
}

export type MyDuConnectionInput = {
  callbackUrl: string;
  studyYear: number;
  term: number;
  firstWeekStart: string;
};
