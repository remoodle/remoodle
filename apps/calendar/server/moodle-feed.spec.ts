import { describe, expect, test } from "vite-plus/test";
import { parseMoodleFeed, validateMoodleUrl } from "./moodle-feed";
import { filterMoodle, moodleToIcalEvents } from "../shared/moodle";
import { generateCalendarEventsIcal } from "../shared/ical";
import { moodleToCalendarEvents } from "../src/lib/moodle-calendar";
import { encryptSecret, decryptSecret } from "./secrets";

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
  test("turns Moodle UIDs into selector-safe stable IDs", () => {
    const events = parseMoodleFeed(
      feed(
        "SUMMARY:Midterm\r\nDTSTART:20260913T185900Z\r\nDTEND:20260913T195900Z",
        "moodle-232745@lms.astanait.edu.kz",
      ),
    );
    expect(events[0]?.id).toBe("moodle-moodle-232745@lms.astanait.edu.kz");
    const display = moodleToCalendarEvents(events)[0]!;
    expect(String(display.id)).toMatch(/^[a-zA-Z0-9_-]+$/);
    expect(moodleToCalendarEvents(events)[0]?.id).toBe(display.id);
  });
  test("preserves a Sunday 23:59 deadline through display and export", () => {
    const events = parseMoodleFeed(
      feed("SUMMARY:Assignment 1 is due\r\nDTSTART:20260913T185900Z\r\nDTEND:20260913T185900Z"),
    );
    expect(events[0]?.start).toBe("2026-09-13T23:59:00");
    const display = moodleToCalendarEvents(events)[0]!;
    expect(display.title).toBe("23:59 · Assignment 1 is due");
    expect(display.start.toString()).toBe("2026-09-13");
    const ics = generateCalendarEventsIcal(moodleToIcalEvents(events));
    expect(ics).toContain("DTSTART:20260913T185900Z");
    expect(ics).toContain("DTEND:20260913T185900Z");
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
    expect(moodleToCalendarEvents(dates)[0]?.end.toString()).toBe("2026-10-06");
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
  test("encrypts URLs and binds decryption to the account and source", async () => {
    const encrypted = await encryptSecret("private-feed", "test-key", "moodle:user-1");
    expect(encrypted).not.toContain("private-feed");
    expect(await decryptSecret(encrypted, "test-key", "moodle:user-1")).toBe("private-feed");
    await expect(decryptSecret(encrypted, "test-key", "moodle:user-2")).rejects.toThrow();
    await expect(decryptSecret(encrypted, "test-key", "user-1")).rejects.toThrow();
  });
});
