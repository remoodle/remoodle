import { describe, expect, test, vi } from "vitest";
import type { Deadline } from "@remoodle/types";
import type { GradeChangeDiff, DeadlineReminderDiff } from "../shims";
import { processDeadlines } from "../checker";
import { formatCourseDiffs, formatDeadlineReminders } from "../formatter";

describe("grades notifications", () => {
  test("formatCourseDiffs: single", () => {
    const diffs: GradeChangeDiff[] = [
      {
        course: "Introduction to SRE | Meirmanova Aigul",
        courseId: 1234,
        grades: [["Final exam documentation submission", null, 100, 100]],
      },
    ];

    expect(formatCourseDiffs(diffs)).toMatchInlineSnapshot(`
      "Updated grades:

      📘 Introduction to SRE:
        • Final exam documentation submission: <b>N/A → 100</b>
      "
    `);
  });

  test("formatCourseDiffs: multiple courses and grades", () => {
    const diffs: GradeChangeDiff[] = [
      {
        course: "Course 1",
        courseId: 1,
        grades: [["Midterm", null, 100, 100]],
      },
      {
        course: "Course 2",
        courseId: 2,
        grades: [
          ["Midterm", null, 92.85714, 100],
          ["Endterm", null, 23, 50],
        ],
      },
    ];

    expect(formatCourseDiffs(diffs)).toMatchInlineSnapshot(`
      "Updated grades:

      📘 Course 1:
        • Midterm: <b>N/A → 100</b>

      📘 Course 2:
        • Midterm: <b>N/A → 92.86</b>
        • Endterm: <b>N/A → 23</b> (out of 50)
      "
    `);
  });
});

type DeadlineData = Deadline & {
  notifications: Record<string, boolean>;
};

describe("deadlines notifications", () => {
  vi.setSystemTime(new Date("2024-09-15T12:24:00"));

  test("processDeadlines", () => {
    const deadlines: DeadlineData[] = [
      {
        course_id: 4911,
        course_name: "Research Methods and Tools | Omirgaliyev Ruslan",
        event_id: 515515,
        instance: 139102,
        name: "Assignment 1 is due",
        timestart: 1726426740,
        visible: false,
        assignment: {
          assignment_id: 43254,
          cmid: 139102,
          duedate: 1726426740, // Sun Sep 15 2024 18:59:00 GMT+0000
          grade: null,
          gradeEntity: {
            graderaw: null,
          },
        },
        notifications: {},
      },
      {
        event_id: 515578,
        timestart: 1726167600,
        instance: 139106,
        name: "practice 1 is due",
        visible: false,
        course_id: 4963,
        course_name: "Computer Networks | Akerke Auelbayeva",
        assignment: {
          assignment_id: 43255,
          cmid: 139106,
          duedate: 1726167600,
          grade: null,
          gradeEntity: {
            graderaw: null,
          },
        },
        notifications: {},
      },
    ];

    const diff: DeadlineReminderDiff[] = [
      {
        eid: 515515,
        course: "Research Methods and Tools | Omirgaliyev Ruslan",
        deadlines: [
          ["Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"],
        ],
      },
    ];

    expect(
      processDeadlines(deadlines, ["6 hours", "12 hours", "24 hours"]),
    ).toStrictEqual(diff);
  });

  test("not started thresholds", () => {
    const deadlines: DeadlineData[] = [
      {
        course_id: 4911,
        course_name: "Research Methods and Tools | Omirgaliyev Ruslan",
        event_id: 515515,
        instance: 139102,
        name: "Assignment 1 is due",
        timestart: 1726426740,
        visible: false,
        assignment: {
          assignment_id: 43254,
          cmid: 139102,
          duedate: 1726426740, // Sun Sep 15 2024 18:59:00 GMT+0000
          grade: 100,
        },
        notifications: {},
      },
    ];

    const diff: DeadlineReminderDiff[] = [];

    expect(processDeadlines(deadlines, ["6 hours"])).toStrictEqual(diff);
  });

  test("checked thresholds", () => {
    const deadlines: DeadlineData[] = [
      {
        course_id: 4911,
        course_name: "Research Methods and Tools | Omirgaliyev Ruslan",
        event_id: 515515,
        instance: 139102,
        name: "Assignment 1 is due",
        timestart: 1726426740,
        visible: false,
        assignment: {
          assignment_id: 43254,
          cmid: 139102,
          duedate: 1726426740, // Sun Sep 15 2024 18:59:00 GMT+0000
          grade: 100,
        },
        notifications: {
          "12 hours": true,
        },
      },
    ];

    const diff: DeadlineReminderDiff[] = [];

    expect(processDeadlines(deadlines, ["12 hours"])).toStrictEqual(diff);
  });

  test("formatDeadlineReminders", () => {
    const diffs: DeadlineReminderDiff[] = [
      {
        eid: 515515,
        course: "Research Methods and Tools | Omirgaliyev Ruslan",
        deadlines: [
          ["Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"],
          ["Assignment 2 is due", 1726426740000, "06:35:00", "12 hours"],
        ],
      },
      {
        eid: 515515,
        course: "Writing | Barak Omaba",
        deadlines: [
          ["Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"],
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
