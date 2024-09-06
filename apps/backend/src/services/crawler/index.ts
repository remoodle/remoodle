import cron from "node-cron";
import { db } from "../../library/db";
import { fetchCourses } from "./tasks/fetch-courses";

const FIVE_MINUTES = "*/5 * * * *";

const startCrawler = async () => {
  console.log("[crawler] Starting");

  cron.schedule(
    FIVE_MINUTES,
    () => {
      fetchCourses(db.messageStream).catch((error) => {
        console.error("Error running script:", error);
      });
    },
    {
      runOnInit: true,
    },
  );
};

export { startCrawler };
