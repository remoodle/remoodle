import { db } from "../../library/db";
import type { MessageStream } from "../../library/db";
import { RMC } from "../../library/rmc-sdk";
import type {
  GradeChangeEvent,
  DeadlineReminderEvent,
  DeadlineReminderDiff,
} from "./diff-processor/shims";
import { trackCourseDiff, processDeadlines } from "./diff-processor/checker";
import {
  DEFAULT_THRESHOLDS,
  DEFAULT_THRESHOLDS_NOTIFICATIONS,
} from "./diff-processor/thresholds";

export const fetchCourses = async (messageStream: MessageStream) => {
  const t0 = performance.now();

  console.log(`[crawler] Starting fetching courses`);

  const users = await db.user.find({
    telegramId: { $exists: true },
    moodleId: { $exists: true },
  });

  console.log(`[crawler] Found ${users.length} users with Telegram ID`);

  for (const user of users) {
    try {
      const rmc = new RMC({ moodleId: user.moodleId });

      const [data, error] = await rmc.v1_user_courses_overall();

      if (error) {
        console.error(
          `[crawler] Couldn't fetch courses for user ${user.name} (${user.moodleId})`,
          error.message,
          error.status,
        );
        continue;
      }

      // getting old course content
      const currentCourse = await db.course.findOne({ userId: user._id });

      // updating course content
      await db.course.findOneAndUpdate(
        { userId: user._id },
        { $set: { data: data, fetchedAt: new Date() } },
        { upsert: true, new: true },
      );

      // make sure that we have data to compare and create an event if smth changed
      if (
        currentCourse &&
        Array.isArray(currentCourse.data) &&
        currentCourse.data.length &&
        Array.isArray(data) &&
        data.length
      ) {
        const { diffs, hasDiff } = trackCourseDiff(currentCourse.data, data);

        if (hasDiff) {
          const event: GradeChangeEvent = {
            userId: user._id,
            moodleId: user.moodleId,
            payload: diffs,
          };

          await messageStream.add("grade-change", JSON.stringify(event), {
            maxlen: 10000,
          });
        }
      }
    } catch (error) {
      console.error("Error executing crawler:", error);
    }
  }

  const t1 = performance.now();

  console.log(
    `[crawler] Finished fetching courses, took ${t1 - t0} milliseconds.`,
  );
};

export const fetchDeadlines = async (messageStream: MessageStream) => {
  const t0 = performance.now();

  console.log(`[crawler] Starting fetching deadlines`);

  const users = await db.user.find({
    telegramId: { $exists: true },
    moodleId: { $exists: true },
  });

  console.log(`[crawler] Found ${users.length} users with Telegram ID`);

  for (const user of users) {
    try {
      const rmc = new RMC({ moodleId: user.moodleId });

      const [data, error] = await rmc.v1_user_deadlines();

      if (error) {
        console.error(
          `[crawler] Couldn't fetch deadlines for user ${user.name} (${user.moodleId})`,
          error.message,
          error.status,
        );
        continue;
      }

      const currentDeadlines = await db.deadline.findOne({ userId: user._id });

      const newDeadlinesData = data.map((deadline) => ({
        ...deadline,
        notifications:
          currentDeadlines?.data.find((d) => d.event_id === deadline.event_id)
            ?.notifications || DEFAULT_THRESHOLDS_NOTIFICATIONS,
      }));

      await db.deadline.findOneAndUpdate(
        { userId: user._id },
        { $set: { data: newDeadlinesData, fetchedAt: new Date() } },
        { upsert: true, new: true },
      );

      if (!currentDeadlines) {
        continue;
      }

      const deadlineReminders: DeadlineReminderDiff[] = processDeadlines(
        newDeadlinesData,
        DEFAULT_THRESHOLDS,
      );

      if (!deadlineReminders.length) {
        continue;
      }

      for (const reminder of deadlineReminders) {
        const deadline = newDeadlinesData.find(
          (d) => d.event_id === reminder.eid,
        );

        if (!deadline) {
          continue;
        }

        if (deadline) {
          for (const [_name, _date, _remaining, threshold] of reminder.d) {
            if (!deadline.notifications[threshold]) {
              deadline.notifications[threshold] = true;
            }
          }
        }
      }

      await db.deadline.findOneAndUpdate(
        { userId: user._id },
        { $set: { data: newDeadlinesData } },
      );

      const event: DeadlineReminderEvent = {
        userId: user._id,
        moodleId: user.moodleId,
        payload: deadlineReminders,
      };

      await messageStream.add("deadline-reminder", JSON.stringify(event), {
        maxlen: 10000,
      });
    } catch (error) {
      console.error("Error executing crawler:", error);
    }
  }

  const t1 = performance.now();

  console.log(
    `[crawler] Finished fetching deadlines, took ${t1 - t0} milliseconds.`,
  );
};
