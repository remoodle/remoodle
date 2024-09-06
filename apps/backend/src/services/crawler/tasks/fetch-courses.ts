import { db } from "../../../library/db";
import type { MessageStream } from "../../../library/db";
import { RMC } from "../../../library/rmc-sdk";
import type { GradeChangeEvent } from "../../../library/diff-processor/types";
import { trackCourseDiff } from "../../../library/diff-processor/checker";

const fetchCourses = async (messageStream: MessageStream) => {
  console.log(`[crawler] Starting fetching courses`);

  const users = await db.user.find({
    telegramId: { $exists: true },
    moodleId: { $exists: true },
  });

  console.log(`[crawler] Found ${users.length} users with Telegram ID`);

  const t0 = performance.now();

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

export { fetchCourses };
