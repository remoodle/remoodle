import cron from "node-cron";
import { db } from "../../library/db";
import { fetchCourses } from "./crawler";
import { GradeChangeEventHandler } from "./grade-change-event";

const FIVE_MINUTES = "*/5 * * * *";

export async function startNotifier() {
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

  const gradeChangeEventHandler = new GradeChangeEventHandler(db.messageStream);

  await Promise.all([gradeChangeEventHandler.runJob()]);
}
