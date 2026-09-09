import { describe, expect, test } from "vite-plus/test";
import { generateCalendarEventsIcal, mergeAdjacentCalendarEvents } from "./ical";

const event = {
  id: "mydu-1",
  title: "Applied project",
  description: "Teacher",
  start: "2026-09-07 19:00",
  end: "2026-09-07 19:50",
  location: "C1.1",
};
describe("dated personal calendar exports", () => {
  test("uses Almaty time and never invents weekly recurrences", () => {
    const ics = generateCalendarEventsIcal([event]);
    expect(ics).toContain("DTSTART:20260907T140000Z");
    expect(ics).toContain("DTEND:20260907T145000Z");
    expect(ics).not.toContain("RRULE");
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
  });
  test("does not shift an old class into a later export range", () => {
    expect(generateCalendarEventsIcal([event], new Date("2026-09-14T00:00:00Z"))).not.toContain(
      "BEGIN:VEVENT",
    );
  });
  test("merges adjacent slots only on the same date with matching details", () => {
    const second = { ...event, id: "2", start: "2026-09-07 20:00", end: "2026-09-07 20:50" };
    const nextWeek = { ...second, id: "3", start: "2026-09-14 20:00", end: "2026-09-14 20:50" };
    expect(mergeAdjacentCalendarEvents([event, second, nextWeek])).toHaveLength(2);
    expect(mergeAdjacentCalendarEvents([event, second])[0]?.end).toBe("2026-09-07 20:50");
  });
  test("escapes and folds international titles without splitting UTF-8 characters", () => {
    const title = "Расписание".repeat(20) + "\nInjected";
    const ics = generateCalendarEventsIcal([{ ...event, title }]);
    for (const line of ics.split("\r\n"))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(ics.replace(/\r\n /g, "")).toContain("\\nInjected");
  });
});
