import { describe, expect, test } from "vite-plus/test";
import type { MoodleEvent } from "@remoodle/shared/moodle";
import { moodleToCalendarEvents } from "./moodle-calendar";

const event: MoodleEvent = {
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
  test("encodes source IDs into stable selector-safe IDs", () => {
    const [display] = moodleToCalendarEvents([event]);

    expect(String(display!.id)).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(moodleToCalendarEvents([event])[0]!.id).toBe(display!.id);
  });

  test("shows a zero-duration deadline in the date row with its time in the title", () => {
    const [display] = moodleToCalendarEvents([event]);

    expect(display!.title).toBe("23:59 · Assignment 1 is due");
    expect(display!.start.toString()).toBe("2026-09-13");
  });

  test("places timed events at Kazakhstan's fixed UTC+5 offset", () => {
    const [display] = moodleToCalendarEvents([
      { ...event, start: "2026-09-07T19:00:00", end: "2026-09-07T21:00:00" },
    ]);

    expect(display!.start.toString()).toBe("2026-09-07T19:00:00+05:00[Etc/GMT-5]");
    expect(display!.end.toString()).toBe("2026-09-07T21:00:00+05:00[Etc/GMT-5]");
  });

  test("turns exclusive all-day ends into inclusive dates", () => {
    const [display] = moodleToCalendarEvents([
      { ...event, allDay: true, start: "2026-10-05", end: "2026-10-07" },
    ]);

    expect(display!.end.toString()).toBe("2026-10-06");
  });
});
