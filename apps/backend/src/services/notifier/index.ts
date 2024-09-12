import cron from "node-cron";
import { env, config } from "../../config";
import { runCrawler, shutdownCrawler } from "./crawler";
import { shutdownEventHandlers } from "./events";

const gracefulShutdown = (signal: string) => {
  shutdownCrawler(signal);
  shutdownEventHandlers(signal);
};

export async function startNotifier() {
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  cron.schedule(config.notifications.crawlerCron, runCrawler, {
    runOnInit: env.isDevelopment,
  });
}
