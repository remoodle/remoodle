import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import type { ScheduleFilter } from "@remoodle/shared/schedule";
import { client, parseResponse } from "./client";
import { useSessionQuery } from "./session";

const icalToken = client.api["ical-token"];

export const icalTokenQueryKey = ["ical-token"];

export const useIcalTokenQuery = () => {
  const { data: session } = useSessionQuery();

  return useQuery({
    queryKey: icalTokenQueryKey,
    enabled: () => !!session.value?.user,
    queryFn: () => parseResponse(icalToken.$get()),
  });
};

export const useUpsertIcalToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (json: { filters: ScheduleFilter }) => parseResponse(icalToken.$post({ json })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: icalTokenQueryKey }),
  });
};

export const useUpdateIcalFilters = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (json: { filters: ScheduleFilter }) => parseResponse(icalToken.$patch({ json })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: icalTokenQueryKey }),
  });
};
