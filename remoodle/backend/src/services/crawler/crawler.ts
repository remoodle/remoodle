import cron from "node-cron";
import { db } from "../../database";
import { fetchCourses } from "./tasks/fetch-courses";

const FIVE_MINUTES = "*/5 * * * *";

const startCrawler = async () => {
  // just handing there for the Core to start
  await new Promise((resolve) => setTimeout(resolve, 10_000));

  // await db.messageStream.add(
  //   "grade-change",
  //   JSON.stringify({
  //     userId: 123,
  //     moodleId: 1232,
  //     payload: [],
  //   }),
  //   {
  //     maxlen: 10000,
  //   },
  // );

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
