import { describe, expect, test } from "vite-plus/test";
import { generateCalendarEventsIcal, generateScheduleIcal } from "./ical";

describe("generateScheduleIcal", () => {
  test("exports schedule events with weekly RRULE and respects range end", () => {
    const ics = generateScheduleIcal(
      [
        {
          id: "oop-lecture",
          start: "Monday 10:00",
          end: "Monday 10:50",
          courseName: "OOP",
          location: "C1.3.242",
          isOnline: false,
          teacher: "A. Teacher",
          type: "lecture",
        },
      ],
      new Date("2026-04-10T00:00:00Z"),
      {
        eventTimeFormat: "utc",
        rangeStart: new Date("2026-04-13T00:00:00Z"),
        rangeEnd: new Date("2026-05-10T00:00:00Z"),
      },
    );

    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("SUMMARY:OOP");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=");
    expect(ics).toContain("DTSTART:20260413T050000Z");
  });
});

describe("generateCalendarEventsIcal", () => {
  test("exports weekly events with RRULE instead of duplicating VEVENTs", () => {
    const ics = generateCalendarEventsIcal(
      [
        {
          id: "learn-ict",
          title: "Learn ICT",
          description: "Sunday study block",
          start: "2026-04-12 23:00",
          end: "2026-04-12 23:50",
          location: "Astana IT University",
        },
      ],
      new Date("2026-04-10T00:00:00"),
      new Date("2026-05-10T00:00:00"),
    );

    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("SUMMARY:Learn ICT");
    expect(ics).toContain("DTSTART;TZID=Asia/Almaty:20260412T230000");
    expect(ics).toContain("DTEND;TZID=Asia/Almaty:20260412T235000");
    expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=SU;UNTIL=");
    expect(ics).not.toContain("learn-ict-2026-");
  });

  test("skips events whose first occurrence is outside the selected export range", () => {
    const ics = generateCalendarEventsIcal(
      [
        {
          id: "late-event",
          title: "Late Event",
          description: "",
          start: "2026-06-01 10:00",
          end: "2026-06-01 10:50",
          location: "Astana IT University",
        },
      ],
      new Date("2026-04-10T00:00:00"),
      new Date("2026-05-10T00:00:00"),
    );

    expect(ics.match(/BEGIN:VEVENT/g)).toBeNull();
  });
});
