import type { Hono } from "hono";
import type { MessageStream } from "../database";
import { User, Course } from "../database";
import { config } from "../config";

import type { ExtendedCourse, Grade } from "./types";

const fetchCourses = async (messageStream: MessageStream, api: Hono) => {
  const users = await User.find({ telegramId: { $exists: true } });

  for (const user of users) {
    const data = await api.request("/x/v1/user/courses/overall", {
      headers: {
        Authorization: `Bearer ${config.internal.secret}::${user.telegramId}`,
        "X-Forwarded-Host": "http://aitu:8080/",
        "Content-Type": "application/json",
      },
    });

    const json = await data.json();

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
  }
};

const trackCourseDiff = (
  oldData: ExtendedCourse[],
  newData: ExtendedCourse[],
) => {
  const diffs = [];

  // Create a map for quick lookup of old courses by course_id
  const oldCoursesMap = new Map(
    oldData.map((course) => [course.course_id, course]),
  );

  // Iterate through each course in newData to detect changes
  for (const newCourse of newData) {
    const oldCourse = oldCoursesMap.get(newCourse.course_id);

    if (oldCourse) {
      let courseChanged = false;
      const gradeChanges: any[] = [];

      // Create a map for quick lookup of old grades by grade_id
      const oldGradesMap = new Map(
        oldCourse.grades?.map((grade) => [grade.grade_id, grade]),
      );

      // Check each grade in newCourse for changes
      if (newCourse.grades) {
        for (const newGrade of newCourse.grades) {
          const oldGrade = oldGradesMap.get(newGrade.grade_id);
          const previous = oldGrade ? oldGrade.graderaw : "-";
          const updated = newGrade.graderaw;

          // Check if the grade exists and if it has changed
          if (!oldGrade || previous !== updated) {
            gradeChanges.push({
              name: newGrade.name,
              previous: previous,
              updated: updated,
            });
            courseChanged = true;
          }
        }
      }

      // If any grades changed, push a structured diff for the course
      if (courseChanged) {
        diffs.push({
          course: `${newCourse.name}`,
          grades: gradeChanges,
        });
      }
    } else {
      if (!newCourse.grades) continue;

      // Handle completely new courses
      const gradeChanges = newCourse.grades.map((grade) => ({
        name: grade.name,
        previous: "-",
        updated: grade.graderaw,
      }));
      diffs.push({
        course: `${newCourse.name}`,
        grades: gradeChanges,
      });
    }
  }

  return {
    diffs,
    hasDiff: diffs.length > 0,
  };
};

export { fetchCourses };
