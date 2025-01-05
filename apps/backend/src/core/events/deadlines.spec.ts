import { describe, expect, test, vi } from "vitest";
import { fromPartial } from "@total-typescript/shoehorn";
import type { Deadline } from "@remoodle/types";
import type { DeadlineReminderDiff } from "./deadlines";
import { trackDeadlineReminders, formatDeadlineReminders } from "./deadlines";

describe("deadlines notifications", () => {
  vi.setSystemTime(new Date("2024-09-15T12:24:00"));

  test("trackDeadlineReminders", () => {
    const deadlines: Deadline[] = fromPartial([
      {
        id: 515515,
        name: "Assignment 1 is due",
        timestart: 1726426740,
        course: {
          id: 4911,
          fullname: "Research Methods and Tools | Omirgaliyev Ruslan",
        },
        reminders: {},
      },
      {
        id: 515578,
        name: "practice 1 is due",
        timestart: 1726167600,
        course: {
          id: 4963,
          fullname: "Computer Networks | Akerke Auelbayeva",
        },
        reminders: {},
      },
    ]);

    const diff: DeadlineReminderDiff[] = [
      {
        courseId: 4911,
        courseName: "Research Methods and Tools | Omirgaliyev Ruslan",
        deadlines: [
          [
            515515,
            "Assignment 1 is due",
            1726426740000,
            "06:35:00",
            "12 hours",
          ],
        ],
      },
    ];

    expect(
      trackDeadlineReminders(deadlines, ["6 hours", "12 hours", "24 hours"]),
    ).toStrictEqual(diff);
  });

  test("not started thresholds", () => {
    const deadlines: Deadline[] = fromPartial([
      {
        id: 515515,
        name: "Assignment 1 is due",
        timestart: 1726426740,
        course: {
          id: 4911,
          fullname: "Research Methods and Tools | Omirgaliyev Ruslan",
        },
        reminders: {},
      },
    ]);

    const diff: DeadlineReminderDiff[] = [];

    expect(trackDeadlineReminders(deadlines, ["6 hours"])).toStrictEqual(diff);
  });

  test("checked thresholds", () => {
    const deadlines: Deadline[] = fromPartial([
      {
        id: 515515,
        name: "Assignment 1 is due",
        course: {
          id: 4911,
          fullname: "Research Methods and Tools | Omirgaliyev Ruslan",
        },
        reminders: {
          "12 hours": true,
        },
      },
    ]);

    const diff: DeadlineReminderDiff[] = [];

    expect(trackDeadlineReminders(deadlines, ["12 hours"])).toStrictEqual(diff);
  });

  test("formatDeadlineReminders", () => {
    const diffs: DeadlineReminderDiff[] = [
      {
        courseId: 515515,
        courseName: "Research Methods and Tools | Omirgaliyev Ruslan",
        deadlines: [
          [1, "Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"],
          [2, "Assignment 2 is due", 1726426740000, "06:35:00", "12 hours"],
        ],
      },
      {
        courseId: 515515,
        courseName: "Writing | Barak Omaba",
        deadlines: [
          [1, "Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"],
        ],
      },
    ];

    expect(formatDeadlineReminders(diffs)).toMatchInlineSnapshot(`
      "🔔 Upcoming deadlines 🔔

      🗓 Research Methods and Tools | Omirgaliyev Ruslan
        • Assignment 1 is due: <b>06:35:00</b>, Sun, Sep 15, 2024, 23:59
        • Assignment 2 is due: <b>06:35:00</b>, Sun, Sep 15, 2024, 23:59

      🗓 Writing | Barak Omaba
        • Assignment 1 is due: <b>06:35:00</b>, Sun, Sep 15, 2024, 23:59

      "
    `);
  });
});
