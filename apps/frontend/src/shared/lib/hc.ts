import { createHC } from "@remoodle/utils";
import type { AppType } from "@remoodle/backend";

import { useUserStore } from "@/shared/stores/user";
import { API_URL } from "@/shared/config";

const { request, requestUnwrap } = createHC<AppType>(API_URL);

const getAuthHeaders = (token?: string) => {
  return {
    Authorization: `Bearer ${token ?? useUserStore().accessToken}`,
  };
};

export { request, requestUnwrap, getAuthHeaders };
