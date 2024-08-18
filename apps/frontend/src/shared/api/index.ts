import { createHC } from "@remoodle/hc-wrapper";
import type { AppType } from "@remoodle/backend";

import { useUserStore } from "@/shared/stores/user";

const { request } = createHC<AppType>("http://localhost:9000/");

const getAuthHeaders = () => {
  const userStore = useUserStore();

  return {
    Authorization: `Bearer ${userStore.accessToken}`,
  };
};

export { request, getAuthHeaders };
