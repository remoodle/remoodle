import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
import type { ScheduleFilter } from "@/lib/types";
import { client, DetailedError, parseResponse } from "./client";

export type IcalTokenResponse = {
  token: string;
  group: string;
  url: string;
  filters: ScheduleFilter | null;
} | null;

export const icalTokenQueryKey = (group: string) => ["ical-token", group];

export const useIcalTokenQuery = (group: () => string) =>
  useQuery({
    queryKey: computed(() => icalTokenQueryKey(group())),
    queryFn: async (): Promise<IcalTokenResponse> => {
      try {
        return await parseResponse(
          client.api.user["ical-token"].$get({
            query: { group: group() },
          }),
        );
      } catch (error) {
        if (error instanceof DetailedError && error.statusCode === 401) {
          return null;
        }

        throw error;
      }
    },
    enabled: () => !!group(),
  });

export const useUpsertIcalToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { group: string; filters: ScheduleFilter }) =>
      parseResponse(
        client.api.user["ical-token"].$post({
          json: payload,
        }),
      ),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: icalTokenQueryKey(payload.group),
      }),
  });
};

export const useUpdateIcalFilters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { group: string; filters: ScheduleFilter }) =>
      parseResponse(
        client.api.user["ical-token"].$patch({
          json: payload,
        }),
      ),
    onSuccess: (_, payload) =>
      queryClient.invalidateQueries({
        queryKey: icalTokenQueryKey(payload.group),
      }),
  });
};
