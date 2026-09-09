import { expect, test } from "vite-plus/test";
import { moodleToDeadlineEvents } from "./calendar";
import type { MoodleEvent } from "../../../calendar/shared/moodle";

const deadline: MoodleEvent = {
  id: "moodle-232745@lms.astanait.edu.kz",
  title: "Assignment 1 is due",
  description: "",
  courseName: "Software",
  start: "2026-09-13T23:59:00",
  end: "2026-09-13T23:59:00",
  allDay: false,
  kind: "assignment",
};

test("keeps reminder identity and Almaty deadline time from Calendar", () => {
  expect(moodleToDeadlineEvents([deadline])[0]).toMatchObject({
    uid: "232745@lms.astanait.edu.kz",
    timestampMs: Date.parse("2026-09-13T18:59:00Z"),
    summary: "Assignment 1 is due",
  });
});

test("excludes attendance but retains quizzes and other events", () => {
  expect(
    moodleToDeadlineEvents([
      { ...deadline, kind: "attendance" },
      { ...deadline, kind: "other" },
    ]),
  ).toHaveLength(1);
});

test("uses Almaty midnight for date-only events", () => {
  expect(
    moodleToDeadlineEvents([
      { ...deadline, allDay: true, start: "2026-09-13", end: "2026-09-14" },
    ])[0]?.timestampMs,
  ).toBe(Date.parse("2026-09-12T19:00:00Z"));
});
