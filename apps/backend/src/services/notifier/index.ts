import cron from "node-cron";
import { env } from "../../config";
import { runCrawler, shutdownCrawler } from "./crawler";
import { shutdownEventHandlers } from "./event-handlers";

export async function startNotifier() {
  process.once("SIGINT", () => {
    shutdownCrawler();
    shutdownEventHandlers();
  });

  if (env.isProduction) {
    // wait for 30 seconds just in case
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }

  // every 10 minutes
  cron.schedule("*/10 * * * *", runCrawler, { runOnInit: true });
}
