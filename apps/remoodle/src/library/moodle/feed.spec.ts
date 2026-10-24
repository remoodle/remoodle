import { describe, expect, test } from "vite-plus/test";
import { parseMoodleFeed, validateMoodleUrl } from "./feed";
import { filterMoodle, moodleToIcalEvents } from "../../shared/moodle";
import { generateCalendarEventsIcal } from "../../shared/ical";

const feed = (event: string, uid = "test") =>
  "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:" +
  uid +
  "\r\n" +
  event +
  "\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n";

describe("Moodle import", () => {
  test("retains attendance, but hides it by default", () => {
    const attendance = feed(
      "SUMMARY:Attendance (Group CSE-2507M)\r\nDTSTART:20260910T140000Z\r\nDTEND:20260910T145000Z\r\nCATEGORIES:Applied Software Development | Teacher",
    );

    const assignment = feed(
      "SUMMARY:Assignment 1 is due\r\nDTSTART:20260913T185900Z\r\nDTEND:20260913T185900Z\r\nCATEGORIES:Fault tolerance and reliability | Teacher",
    );

    const events = parseMoodleFeed(attendance).concat(parseMoodleFeed(assignment));
    expect(events.some((e) => e.kind === "attendance")).toBe(true);
    expect(filterMoodle(events).every((e) => e.kind !== "attendance")).toBe(true);
    expect(events.some((e) => e.kind === "assignment" && !!e.courseName)).toBe(true);
  });
  test("keeps Moodle UIDs as stable source IDs", () => {
    const events = parseMoodleFeed(
      feed(
        "SUMMARY:Midterm\r\nDTSTART:20260913T185900Z\r\nDTEND:20260913T195900Z",
        "moodle-232745@lms.astanait.edu.kz",
      ),
    );

    expect(events[0]?.id).toBe("moodle-moodle-232745@lms.astanait.edu.kz");
  });
  test("preserves a Sunday 23:59 deadline through export", () => {
    const events = parseMoodleFeed(
      feed("SUMMARY:Assignment 1 is due\r\nDTSTART:20260913T185900Z\r\nDTEND:20260913T185900Z"),
    );

    expect(events[0]?.start).toBe("2026-09-13T23:59:00");
    const ics = generateCalendarEventsIcal(moodleToIcalEvents(events));
    expect(ics).toContain("DTSTART:20260913T185900Z");
    expect(ics).toContain("DTEND:20260913T185900Z");
  });
  test("uses Kazakhstan's current UTC+5 offset without regional timezone data", () => {
    const events = parseMoodleFeed(
      feed(
        "SUMMARY:Attendance (Group CSE-2507M)\r\nDTSTART:20260907T140000Z\r\nDTEND:20260907T160000Z",
      ),
    );

    expect(events[0]).toMatchObject({
      start: "2026-09-07T19:00:00",
      end: "2026-09-07T21:00:00",
    });
  });
  test("handles TZID, folded text, quiz classification, and all-day exclusive ends", () => {
    const timed = parseMoodleFeed(
      feed(
        "SUMMARY:Midterm\r\n (MCQ)\r\nDTSTART;TZID=Asia/Almaty:20261005T195000\r\nDTEND;TZID=Asia/Almaty:20261005T200000",
      ),
    );

    expect(timed[0]).toMatchObject({
      title: "Midterm(MCQ)",
      kind: "other",
      start: "2026-10-05T19:50:00",
    });

    const dates = parseMoodleFeed(
      feed("SUMMARY:Conference\r\nDTSTART;VALUE=DATE:20261005\r\nDTEND;VALUE=DATE:20261007"),
    );

    expect(generateCalendarEventsIcal(moodleToIcalEvents(dates))).toContain(
      "DTEND;VALUE=DATE:20261007",
    );
  });
  test("rejects HTML and unsupported recurrence rather than silently deleting events", () => {
    expect(() => parseMoodleFeed("<html>Sign in</html>")).toThrow();
    expect(() =>
      parseMoodleFeed(feed("SUMMARY:Recurring\r\nDTSTART:20260913T185900Z\r\nRRULE:FREQ=DAILY")),
    ).toThrow();
  });
  test("accepts only the AITU Moodle export endpoint", () => {
    const valid = "https://lms.astanait.edu.kz/calendar/export_execute.php?userid=1&authtoken=abc";
    expect(validateMoodleUrl(valid)).toBe(valid);

    for (const invalid of [
      valid.replace("https:", "http:"),
      valid.replace("lms.astanait.edu.kz", "localhost"),
      valid.replace("/calendar/", "/admin/"),
      valid.replace("https://", "https://user:pass@"),
      valid + "#fragment",
    ]) {
      expect(() => validateMoodleUrl(invalid)).toThrow();
    }
  });
});
