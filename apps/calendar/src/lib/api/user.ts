import { useMutation } from "@tanstack/vue-query";
import { client, parseResponse } from "./client";
export const useGenerateRemoodleToken = () =>
  useMutation({
    mutationFn: () => parseResponse(client.api.user["remoodle-token"].$post()),
  });
