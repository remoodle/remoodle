import { useQuery } from "@tanstack/vue-query";
import { client, parseResponse } from "./client";

export const useGroupsQuery = () =>
  useQuery({
    queryKey: ["groups"],
    queryFn: () => parseResponse(client.api.groups.$get()),
  });

export const useGroupScheduleQuery = (group: () => string) =>
  useQuery({
    queryKey: ["schedule", group],
    queryFn: () => parseResponse(client.api.groups[":group"].$get({ param: { group: group() } })),
    enabled: () => !!group(),
  });
