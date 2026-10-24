import { useQuery } from "@tanstack/vue-query";
import { client, parseResponse } from "./client";
import { useSessionQuery } from "./session";

export function useMyDuSchedule() {
  const { data: session } = useSessionQuery();

  return useQuery({
    queryKey: ["my-du-schedule", () => session.value?.user?.telegramId],
    enabled: () => !!session.value?.user,
    queryFn: () => parseResponse(client.api["my-du"].$get()),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });
}
