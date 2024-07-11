import cron from "node-cron";
import type { MessageStream } from "../../database/redis/models/MessageStream";
import { fetchCourses } from "./tasks/fetch-courses";

const FIVE_MINUTES = "*/5 * * * *";

const startCrawler = async (messageStream: MessageStream) => {
  cron.schedule(
    FIVE_MINUTES,
    () => {
      console.log("Running crawler...");
      fetchCourses(messageStream).catch((error) => {
        console.error("Error running script:", error);
      });
    },
    {
      runOnInit: true,
    },
  );
};

export { startCrawler };
