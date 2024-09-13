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

  cron.schedule(
    config.crawler.gradesCron,
    () => runCrawler({ fetchCourses: true }),
    {
      runOnInit: env.isDevelopment,
    },
  );

  cron.schedule(
    config.crawler.deadlinesCron,
    () => runCrawler({ fetchDeadlines: true }),
    {
      runOnInit: env.isDevelopment,
    },
  );
}
