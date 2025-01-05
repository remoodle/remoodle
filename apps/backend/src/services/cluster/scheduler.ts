import { mSecOneHour, mSecOneMinute } from "../../config/constants";
import { queues, Task } from "./queues";

export const startScheduler = async () => {
  await queues.gradesQueue.upsertJobScheduler(Task.SCHEDULE_GRADES, {
    every: mSecOneMinute * 6,
  });

  await queues.coursesQueue.upsertJobScheduler(Task.SCHEDULE_COURSES, {
    every: mSecOneHour * 3,
  });

  await queues.eventsQueue.upsertJobScheduler(Task.SCHEDULE_EVENTS, {
    every: mSecOneMinute * 4,
  });

  await queues.remindersQueue.upsertJobScheduler(Task.SCHEDULE_REMINDERS, {
    pattern: "0 */5 * * * *",
  });
};
