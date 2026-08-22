import { experimental_createQueryPersister } from "@tanstack/query-persist-client-core";
import { QueryClient } from "@tanstack/vue-query";
import { getStorageKey } from "./helpers";

const persister = experimental_createQueryPersister({
  storage: window.localStorage,
  maxAge: 1000 * 60 * 60 * 12, // 12 hours
  prefix: getStorageKey("tanstack-query"),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      persister: persister.persisterFn,
    },
  },
});

export { queryClient };
