import type { Hono } from "hono";
import { config } from "../config";
import type { MessageStream } from "../database";
import { Course, User } from "../database";
import { trackCourseDiff } from "./internal/parser";

const fetchCourses = async (messageStream: MessageStream, api: Hono) => {
  console.log("Fetching courses...");

  const t0 = performance.now();

  const users = await User.find({ telegramId: { $exists: true } });

  for (const user of users) {
    try {
      const response = await api.request("/x/v1/user/courses/overall", {
        headers: {
          Authorization: `Bearer ${config.http.secret}::${user.telegramId}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.log(await response.json());
        throw new Error("Failed to fetch courses");
      }

      const json = await response.json();

      const currentCourse = await Course.findOne({ userId: user._id });

      if (currentCourse) {
        const { diffs, hasDiff } = trackCourseDiff(currentCourse.data, json);

        if (hasDiff) {
          for (const diff of diffs) {
            await messageStream.add(
              "grade-change",
              JSON.stringify({
                moodleId: user.moodleId,
                payload: diff,
              }),
              { maxlen: 10000 },
            );
          }
        }
      }

      await Course.findOneAndUpdate(
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
