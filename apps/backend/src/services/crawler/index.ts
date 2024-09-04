import cron from "node-cron";
import { db } from "../../library/db";
import { fetchCourses } from "./tasks/fetch-courses";

const FIVE_MINUTES = "*/5 * * * *";

const startCrawler = async () => {
  // just hanging there for the Core to start
  await new Promise((resolve) => setTimeout(resolve, 10_000));

  cron.schedule(
    FIVE_MINUTES,
    () => {
      console.log("Running crawler...");
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
