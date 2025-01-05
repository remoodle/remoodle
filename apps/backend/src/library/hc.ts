import { createHC } from "@remoodle/utils";
import type { AppType as AlertWorkerAppType } from "@remoodle/alert-worker";
import type { AppType as ClusterAppType } from "../services/cluster";

import { config } from "../config";

export const { request: requestAlertWorker } = createHC<AlertWorkerAppType>(
  config.alert.url,
  {
    headers: {
      ...(config.alert.enabled && {
        Authorization: `Bearer ${config.alert.secret}`,
      }),
    },
  },
);

export const { request: requestCluster } = createHC<ClusterAppType>(
  config.cluster.url,
  {
    headers: {
      Authorization: `Bearer ${config.cluster.secret}`,
    },
  },
);
