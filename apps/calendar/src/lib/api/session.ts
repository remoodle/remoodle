import { queryOptions, useQuery, useQueryClient } from "@tanstack/vue-query";
import { client, parseResponse } from "./client";

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: () => parseResponse(client.api.auth.session.$get()),
  staleTime: 5 * 60_000,
});

export const useSessionQuery = () => useQuery(sessionQuery);

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return async () => {
    await parseResponse(client.api.auth.logout.$post());
    const session = queryClient.getQueryData(sessionQuery.queryKey);
    // Personal data must not survive sign-out in the in-memory cache either.
    queryClient.clear();

    if (session) queryClient.setQueryData(sessionQuery.queryKey, { ...session, user: null });
  };
};
