import { createHC } from "@remoodle/utils";
import type { AppType } from "@remoodle/backend";

import { config } from "../config";

const { request } = createHC<AppType>(config.backend.url);

const getAuthHeaders = (telegramId: number) => {
  return {
    Authorization: `Telegram ${config.backend.secret}::${telegramId}`,
  };
};

export { request, getAuthHeaders };
