import { config } from "../../../config";
import type { MessageStream } from "../../../database/redis/models/MessageStream";
import { db } from "../../../database";
import { trackCourseDiff } from "../../../utils/parser";

const COURSES_OVERALL_URL = new URL(
  "/v1/user/courses/overall",
  config.core.url,
);

const fetchCourses = async (messageStream: MessageStream) => {
  console.log("Fetching courses...");

  const t0 = performance.now();

  const users = await db.user.find({ telegramId: { $exists: true } });

  for (const user of users) {
    if (!user.moodleId) {
      continue;
    }

    try {
      const response = await fetch(COURSES_OVERALL_URL, {
        headers: {
          "Content-Type": "application/json",
          "X-Remoodle-Internal-Token": config.core.secret,
          "X-Remoodle-Moodle-Id": `${user.moodleId}`,
        },
      });

      if (!response.ok) {
        console.log(await response.json());
        throw new Error("Failed to fetch courses");
      }

      const json = await response.json();

      const currentCourse = await db.course.findOne({ userId: user._id });

      if (currentCourse) {
        const { diffs, hasDiff } = trackCourseDiff(currentCourse.data, json);

        if (hasDiff) {
          await messageStream.add(
            "grade-change",
            JSON.stringify({
              moodleId: user.moodleId,
              payload: diffs,
            }),
            { maxlen: 10000 },
          );
        }
      }

      await db.course.findOneAndUpdate(
        { userId: user._id },
        { $set: { data: json, fetchedAt: new Date() } },
        { upsert: true, new: true },
      );
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
