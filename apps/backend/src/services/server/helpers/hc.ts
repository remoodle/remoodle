import { createHC } from "@remoodle/utils";
import type { AppType as AlertWorkerAppType } from "@remoodle/alert-worker";

import { config } from "../../../config";

export const { request: requestAlertWorker } = createHC<AlertWorkerAppType>(
  config.alert.url,
  {
    headers: {
      ...(config.alert.enabled === "1" && {
        Authorization: `Bearer ${config.alert.secret}`,
      }),
    },
  },
);
