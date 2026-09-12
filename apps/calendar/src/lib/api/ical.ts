import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";

import type { ScheduleFilter } from "@/lib/types";
import { client, DetailedError, parseResponse } from "./client";

export type IcalTokenResponse = {
  token: string;
  url: string;
  filters: ScheduleFilter | null;
} | null;

export const icalTokenQueryKey = ["ical-token"];

export const useIcalTokenQuery = () =>
  useQuery({
    queryKey: icalTokenQueryKey,
    queryFn: async (): Promise<IcalTokenResponse> => {
      try {
        return await parseResponse(client.api.user["ical-token"].$get());
      } catch (error) {
        if (error instanceof DetailedError && error.statusCode === 401) {
          return null;
        }

        throw error;
      }
    },
  });

export const useUpsertIcalToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { filters: ScheduleFilter }) =>
      parseResponse(
        client.api.user["ical-token"].$post({
          json: payload,
        }),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: icalTokenQueryKey,
      }),
  });
};

export const useUpdateIcalFilters = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { filters: ScheduleFilter }) =>
      parseResponse(
        client.api.user["ical-token"].$patch({
          json: payload,
        }),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: icalTokenQueryKey,
      }),
  });
};
