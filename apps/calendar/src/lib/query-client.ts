import { QueryClient } from "@tanstack/vue-query";

// Personal schedules and subscription credentials must not survive sign-out in persistent storage.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});
