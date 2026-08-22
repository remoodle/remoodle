import { useQuery, useQueryClient } from "@tanstack/vue-query";
import { authClient } from "@/lib/auth-client";

export const SESSION_QUERY_KEY = ["session"];

export const useSessionQuery = () =>
  useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => authClient.getSession(),
  });

export const useClearSession = () => {
  const queryClient = useQueryClient();
  return () => queryClient.setQueryData(SESSION_QUERY_KEY, null);
};
