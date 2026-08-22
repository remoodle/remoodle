import assert from "node:assert/strict";
import test from "node:test";
import * as v from "valibot";
import { formatLesson } from "../src/model.js";
import { DuLessonSchema } from "../src/schemas.js";

test("formats a DU lesson", () => {
  const lesson = formatLesson(
    v.parse(DuLessonSchema, {
      classtime_day: "1",
      classtime_time: "2",
      days: JSON.stringify({
        days: ["1"],
        daysname: ["2026-09-02"],
        time: [{ id: "2", start: "09:00", finish: "09:50" }],
      }),
      subject: "Algorithms",
      room: "online",
      tutor: "Teacher",
      lesson_type: "lecture",
    }),
  );

  assert.deepEqual(lesson && { ...lesson, id: "stable-for-test" }, {
    id: "stable-for-test",
    start: "2026-09-02 09:00",
    end: "2026-09-02 09:50",
    courseName: "Algorithms",
    location: "online",
    isOnline: true,
    teacher: "Teacher",
    type: "lecture",
  });
});
