import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { client, DetailedError, parseResponse } from "./client";

export const userProfileQueryKey = ["user-profile"];

export const useUserProfileQuery = () =>
  useQuery({
    queryKey: userProfileQueryKey,
    queryFn: async () => {
      try {
        return await parseResponse(client.api.user.profile.$get());
      } catch (error) {
        if (error instanceof DetailedError && error.statusCode === 401) {
          return { primaryGroup: null };
        }

        throw error;
      }
    },
  });

export const useSetPrimaryGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (primaryGroup: string) =>
      parseResponse(
        client.api.user.profile.$patch({
          json: { primaryGroup },
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userProfileQueryKey }),
  });
};

export const useGenerateRemoodleToken = () =>
  useMutation({
    mutationFn: async () => parseResponse(client.api.user["remoodle-token"].$post()),
  });
