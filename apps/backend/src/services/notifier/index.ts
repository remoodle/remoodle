import cron from "node-cron";
import { env } from "../../config";
import { runCrawler, shutdownCrawler } from "./crawler";
import { shutdownEventHandlers } from "./events";

const gracefulShutdown = (signal: string) => {
  shutdownCrawler(signal);
  shutdownEventHandlers(signal);
};

export async function startNotifier() {
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  if (env.isProduction) {
    // wait for 30 seconds just in case
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }

  // every 10 minutes
  cron.schedule("*/10 * * * *", runCrawler, { runOnInit: true });
}
