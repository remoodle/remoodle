import { useQuery } from "@tanstack/vue-query";
import { client, parseResponse } from "./client";
import { useSessionQuery } from "./session";

export function useMoodleSchedule() {
  const { data: session } = useSessionQuery();

  return useQuery({
    queryKey: ["moodle-schedule", () => session.value?.user?.telegramId],
    enabled: () => !!session.value?.user,
    queryFn: () => parseResponse(client.api.moodle.$get()),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });
}
