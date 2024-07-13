import { db } from "../../../database";
import type { MessageStream } from "../../../database";
import {
  API_METHODS,
  getCoreInternalHeaders,
  requestCore,
} from "../../../http/core";
import type { ExtendedCourse, GradeChangeEvent } from "../../../shims";
import { trackCourseDiff } from "../../../utils/parser";

const fetchCourses = async (messageStream: MessageStream) => {
  console.log("Fetching courses...");

  const t0 = performance.now();

  const users = await db.user.find({ telegramId: { $exists: true } });

  for (const user of users) {
    if (!user.moodleId) {
      continue;
    }

    try {
      const [response, error] = await requestCore<ExtendedCourse[]>(
        API_METHODS.V1_USER_COURSES_OVERALL,
        {
          headers: getCoreInternalHeaders(user.moodleId),
        },
      );

      if (error) {
        console.error("Error fetching courses:", error);
        continue;
      }

      // getting old course content
      const currentCourse = await db.course.findOne({ userId: user._id });

      // updating course content
      await db.course.findOneAndUpdate(
        { userId: user._id },
        { $set: { data: response.data, fetchedAt: new Date() } },
        { upsert: true, new: true },
      );

      // make sure that we have data to compare and create an event if smth changed
      if (
        Array.isArray(currentCourse) &&
        currentCourse.length &&
        Array.isArray(response.data) &&
        response.data.length
      ) {
        const { diffs, hasDiff } = trackCourseDiff(
          currentCourse.data,
          response.data,
        );

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
