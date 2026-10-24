import type { InferRequestType } from "hono/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { client, parseResponse } from "./client";
import { useSessionQuery } from "./session";

const myDu = client.api["my-du"];

const queryKey = ["my-du-schedule"];

export function useMyDuSchedule() {
  const { data: session } = useSessionQuery();

  return useQuery({
    queryKey: [...queryKey, () => session.value?.user?.telegramId],
    enabled: () => !!session.value?.user,
    queryFn: () => parseResponse(myDu.$get()),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}

export type MyDuConnectInput = InferRequestType<typeof myDu.connect.$post>["json"];

export type MyDuPeriodInput = InferRequestType<typeof myDu.period.$put>["json"];

export function useMyDuActions() {
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey });

  return {
    start: useMutation({ mutationFn: () => parseResponse(myDu.start.$post()) }),
    connect: useMutation({
      mutationFn: (json: MyDuConnectInput) => parseResponse(myDu.connect.$post({ json })),
      onSuccess,
    }),
    changePeriod: useMutation({
      mutationFn: (json: MyDuPeriodInput) => parseResponse(myDu.period.$put({ json })),
      onSuccess,
    }),
    sync: useMutation({ mutationFn: () => parseResponse(myDu.sync.$post()), onSuccess }),
    disconnect: useMutation({ mutationFn: () => parseResponse(myDu.$delete()), onSuccess }),
  };
}
