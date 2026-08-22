import { beforeEach, describe, expect, test, vi } from "vite-plus/test";
import type { CalendarEvent } from "./calendar";
import {
  buildReminderMessage,
  buildThresholdsMessage,
  trackDeadlineReminders,
} from "./deadline-reminders";

beforeEach(() => {
  vi.stubEnv("TZ", "UTC");
  vi.setSystemTime(new Date("2026-04-08T12:00:00Z"));
});

describe("deadline reminders", () => {
  test("tracks reminders once the next threshold is reached", () => {
    const events: CalendarEvent[] = [
      {
        uid: "event-1",
        summary: "Assignment 1 is due",
        timestampMs: Date.parse("2026-04-08T23:00:00Z"),
        courseName: "Research Methods and Tools",
      },
      {
        uid: "event-2",
        summary: "Practice 1 is due",
        timestampMs: Date.parse("2026-04-13T00:00:00Z"),
        courseName: "Computer Networks",
      },
    ];

    const reminders = trackDeadlineReminders(["PT6H", "PT12H", "P1D"], events, []);

    expect(reminders).toStrictEqual([
      {
        eventId: "event-1",
        triggeredAt: new Date("2026-04-08T12:00:00.000Z"),
      },
    ]);
  });

  test("does not create reminders before any threshold starts", () => {
    const events: CalendarEvent[] = [
      {
        uid: "event-1",
        summary: "Assignment 1 is due",
        timestampMs: Date.parse("2026-04-09T00:01:00Z"),
        courseName: "Research Methods and Tools",
      },
    ];

    const reminders = trackDeadlineReminders(["PT12H"], events, []);

    expect(reminders).toStrictEqual([]);
  });

  test("does not recreate reminders already sent for the active threshold window", () => {
    const events: CalendarEvent[] = [
      {
        uid: "event-1",
        summary: "Assignment 1 is due",
        timestampMs: Date.parse("2026-04-08T23:00:00Z"),
        courseName: "Research Methods and Tools",
      },
    ];

    const reminders = trackDeadlineReminders(["PT12H"], events, [
      {
        eventId: "event-1",
        triggeredAt: new Date("2026-04-08T11:30:00Z"),
      },
    ]);

    expect(reminders).toStrictEqual([]);
  });

  test("formats grouped reminder messages", () => {
    const events: CalendarEvent[] = [
      {
        uid: "event-1",
        summary: "Assignment 1 is due",
        timestampMs: Date.parse("2026-04-08T23:00:00Z"),
        courseName: "Research Methods and Tools",
      },
      {
        uid: "event-2",
        summary: "Assignment 2 is due",
        timestampMs: Date.parse("2026-04-09T01:00:00Z"),
        courseName: "Research Methods and Tools",
      },
      {
        uid: "event-3",
        summary: "Case Study Presentation is due",
        timestampMs: Date.parse("2026-04-08T13:30:00Z"),
        courseName: "Software Development Case Study",
      },
    ];

    const reminders = [
      { eventId: "event-1", triggeredAt: new Date() },
      { eventId: "event-2", triggeredAt: new Date() },
      { eventId: "event-3", triggeredAt: new Date() },
    ];

    expect(buildReminderMessage(events, reminders)).toMatchInlineSnapshot(`
      "🔔 Upcoming deadlines 🔔

      🗓 Research Methods and Tools
        • Assignment 1: <b>11:00:00</b>, Wed, Apr 8, 2026, 23:00
        • Assignment 2: <b>13:00:00</b>, Thu, Apr 9, 2026, 01:00

      🗓 Software Development Case Study
        • Case Study Presentation: <b>01:30:00</b>, Wed, Apr 8, 2026, 13:30"
    `);
  });

  test("formats thresholds in ascending order", () => {
    expect(buildThresholdsMessage(["P1D", "PT30M", "PT6H"])).toMatchInlineSnapshot(`
        "<b>Deadline reminder thresholds</b>

        Active:
          • 30 minutes
          • 6 hours
          • a day

        Toggle thresholds below:"
      `);
  });
});
