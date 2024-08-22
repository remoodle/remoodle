import { createHC } from "@remoodle/hc-wrapper";
import type { AppType } from "@remoodle/backend";

import { config } from "../config";

const { request } = createHC<AppType>("http://localhost:9000/");

const getAuthHeaders = (telegramId: number, withUser: 0 | 1) => {
  return {
    Authorization: `Basic ${config.backend.secret}::${telegramId}::${withUser}`,
  };
};

export { request, getAuthHeaders };
