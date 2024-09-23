import { createHC } from "@remoodle/utils";
import type { AppType } from "@remoodle/backend";

import { useUserStore } from "@/shared/stores/user";
import { API_URL } from "@/shared/config";

const { request } = createHC<AppType>(API_URL);

const getAuthHeaders = () => {
  const userStore = useUserStore();

  return {
    Authorization: `Bearer ${userStore.accessToken}`,
  };
};

export { request, getAuthHeaders };
