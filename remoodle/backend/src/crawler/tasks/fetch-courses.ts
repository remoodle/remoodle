import { config } from "../../../config";
import { db } from "../../../library/db";
import type { MessageStream } from "../../../library/db";
import { RMC } from "../../../library/rmc-sdk";
import type { GradeChangeEvent } from "../../../library/diff-processor/types";
import { trackCourseDiff } from "../../../library/diff-processor/checker";

const fetchCourses = async (messageStream: MessageStream) => {
  console.log("Fetching courses...");

  const t0 = performance.now();

  const users = await db.user.find({ telegramId: { $exists: true } });

  for (const user of users) {
    if (!user.moodleId) {
      continue;
    }

    try {
      const rmc = new RMC(config.core.url, {
        secret: config.core.secret,
        moodleId: user.moodleId,
      });

      const [data, error] = await rmc.getUserCoursesOverall();

      if (error) {
        console.error("Error fetching courses:", error);
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
        Array.isArray(currentCourse) &&
        currentCourse.length &&
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
      console.error("Error fetching courses:", error);
    }
  }

  const t1 = performance.now();

  console.log(
    `Fetched courses for ${users.length} users, took ${t1 - t0} milliseconds.`,
  );
};

export { fetchCourses };
