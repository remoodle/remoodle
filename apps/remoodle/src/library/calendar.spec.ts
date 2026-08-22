import { readFileSync } from "node:fs";
import { describe, expect, test } from "vite-plus/test";
import { parseIcs, shouldIgnoreCalendarEvent } from "./calendar";

const realCalendarFixture = readFileSync(
  new URL("./fixtures/icalexport.ics", import.meta.url),
  "utf8",
);

describe("calendar processing", () => {
  test("parses the real Moodle export and filters attendance events", () => {
    const events = parseIcs(realCalendarFixture);

    expect(events).toHaveLength(8);
    expect(events.every((event) => !shouldIgnoreCalendarEvent(event))).toBe(true);
    expect(events).toContainEqual({
      uid: "197417@lms.astanait.edu.kz",
      summary: "Case Study Presentation is due",
      timestampMs: Date.parse("2026-04-08T18:59:00Z"),
      courseName: "Software Development Case Study",
      description: "_SUBMISSIONS RECEIVED AFTER THE DEADLINE WILL NOT BE ACCEPTED._",
    });
  });

  test("unfolds lines, unescapes text, and parses all-day events", () => {
    const events = parseIcs(`BEGIN:VCALENDAR
BEGIN:VEVENT
UID:event-1
SUMMARY:Lab\\, Quiz\\; Rev
 iew\\ Session is due
DTSTART;VALUE=DATE:20260415
CATEGORIES:Computer   Networks   | Akerke Auelbayeva
END:VEVENT
END:VCALENDAR`);

    expect(events).toStrictEqual([
      {
        uid: "event-1",
        summary: "Lab, Quiz; Review\\ Session is due",
        timestampMs: Date.parse("2026-04-15T00:00:00Z"),
        courseName: "Computer Networks",
        description: undefined,
      },
    ]);
  });

  test("ignores attendance summaries regardless of case or whitespace", () => {
    const events = parseIcs(`BEGIN:VCALENDAR
BEGIN:VEVENT
UID:event-1
SUMMARY:   attendance (group cse-2507m)
DTSTART:20260415T120000Z
END:VEVENT
BEGIN:VEVENT
UID:event-2
SUMMARY:Assignment 5 is due
DTSTART:20260415T120000Z
END:VEVENT
END:VCALENDAR`);

    expect(events).toStrictEqual([
      {
        uid: "event-2",
        summary: "Assignment 5 is due",
        timestampMs: Date.parse("2026-04-15T12:00:00Z"),
        courseName: undefined,
        description: undefined,
      },
    ]);
  });
});
