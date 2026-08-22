import { initLogger } from "evlog";
import { env } from "../config";

export function initRemoodleEvlog(service: string) {
  initLogger({
    env: {
      service,
      environment: env.NODE_ENV,
    },
  });
}
