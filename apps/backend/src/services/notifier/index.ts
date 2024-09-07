import cron from "node-cron";
import { db } from "../../library/db";
import { env } from "../../config";
import { fetchCourses, fetchDeadlines } from "./crawler";
import { GradeChangeEventHandler } from "./grade-change-event";
import { DeadlineReminderEventHandler } from "./deadline-reminder-event";

export async function startNotifier() {
  if (env.isProduction) {
    // wait for 30 seconds just in case
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }

  cron.schedule(
    "*/5 * * * *", // every 5 minutes
    () => fetchCourses(db.messageStream),
    { runOnInit: true },
  );

  cron.schedule(
    "*/10 * * * *", // every 10 minutes
    () => fetchDeadlines(db.messageStream),
    { runOnInit: true },
  );

  const grades = new GradeChangeEventHandler(db.messageStream);
  const deadlines = new DeadlineReminderEventHandler(db.messageStream);

  await Promise.all([grades.runJob(), deadlines.runJob()]);
}
