import { Temporal } from "temporal-polyfill";
import { describe, expect, test } from "vite-plus/test";
import type { MoodleEvent } from "@remoodle/library/moodle/events";
import { layoutDay } from "./calendar-dates";
import { moodleEvents, scheduleEvents } from "./calendar-events";

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

describe("Moodle events on the calendar", () => {
  test("puts a zero-length deadline in the date row with its time", () => {
    const [event] = moodleEvents([deadline]);

    expect(event!.dateRow).toBe(true);
    expect(event!.deadline).toBe("23:59");
    expect(event!.start.toPlainDate().toString()).toBe("2026-09-13");
  });

  test("keeps timed events at their Kazakhstan wall-clock time", () => {
    const [event] = moodleEvents([
      { ...deadline, start: "2026-09-07T19:00:00", end: "2026-09-07T21:00:00" },
    ]);

    expect(event!.dateRow).toBe(false);
    expect(event!.start.toString()).toBe("2026-09-07T19:00:00");
    expect(event!.end.toString()).toBe("2026-09-07T21:00:00");
  });

  test("turns exclusive all-day ends into the last day covered", () => {
    const [event] = moodleEvents([
      { ...deadline, allDay: true, start: "2026-10-05", end: "2026-10-07" },
    ]);

    expect(event!.end.toPlainDate().toString()).toBe("2026-10-06");
  });
});

describe("day layout", () => {
  const item = (id: string, start: string, end: string) => ({
    id,
    start,
    end,
    courseName: id,
    location: "C1.2.248",
    isOnline: false,
    teacher: "",
    type: "lecture" as const,
    lessonType: "Lecture",
  });

  test("splits overlapping classes into columns and leaves the rest full width", () => {
    const events = scheduleEvents([
      item("a", "2026-09-07 09:00", "2026-09-07 10:50"),
      item("b", "2026-09-07 10:00", "2026-09-07 11:50"),
      item("c", "2026-09-07 13:00", "2026-09-07 13:50"),
    ]);

    const layout = layoutDay(events, Temporal.PlainDate.from("2026-09-07"));

    expect(layout.map(({ column, columns }) => [column, columns])).toEqual([
      [0, 2],
      [1, 2],
      [0, 1],
    ]);
  });
});
