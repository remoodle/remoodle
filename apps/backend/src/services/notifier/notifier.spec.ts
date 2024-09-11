import { describe, expect, test, vi } from "vitest";
import { fromPartial } from "@total-typescript/shoehorn";
import type { ExtendedCourse, Deadline } from "@remoodle/types";
import type { GradeChangeDiff, DeadlineReminderDiff } from "./core/shims";
import { trackCourseDiff, processDeadlines } from "./core/checker";
import { formatCourseDiffs, formatDeadlineReminders } from "./core/formatter";

describe("grades notifications", () => {
  test("trackCourseDiff: default behavior", () => {
    const oldData: ExtendedCourse[] = fromPartial([
      {
        course_id: 4496,
        name: "Introduction to SRE | Meirmanova Aigul",
        grades: [
          {
            grade_id: 89083,
            name: "Final exam documentation submission",
            graderaw: null,
          },
        ],
      },
    ]);

    const newData: ExtendedCourse[] = fromPartial([
      {
        course_id: 4496,
        name: "Introduction to SRE | Meirmanova Aigul",
        grades: [
          {
            grade_id: 89083,
            name: "Final exam documentation submission",
            graderaw: 100,
          },
        ],
      },
    ]);

    const diffs: GradeChangeDiff[] = [
      {
        c: "Introduction to SRE | Meirmanova Aigul",
        g: [["Final exam documentation submission", null, 100]],
      },
    ];

    expect(trackCourseDiff(oldData, newData)).toStrictEqual({
      diffs,
      hasDiff: true,
    });
  });

  test("trackCourseDiff: do not include [_, null, null] diffs", () => {
    const oldData: ExtendedCourse[] = [];

    const newData: ExtendedCourse[] = fromPartial([
      {
        course_id: 4496,
        name: "Introduction to SRE | Meirmanova Aigul",
        grades: [
          {
            grade_id: 89083,
            name: "Final exam documentation submission",
            graderaw: null,
          },
        ],
      },
    ]);

    const diffs: GradeChangeDiff[] = [];

    expect(trackCourseDiff(oldData, newData)).toStrictEqual({
      diffs,
      hasDiff: false,
    });
  });

  test("trackCourseDiff: do not include [_, null, 0] diffs", () => {
    const oldData: ExtendedCourse[] = [];

    const newData: ExtendedCourse[] = fromPartial([
      {
        course_id: 4496,
        name: "Introduction to SRE | Meirmanova Aigul",
        grades: [
          {
            grade_id: 89083,
            name: "Final exam documentation submission",
            graderaw: null,
          },
          {
            grade_id: 89084,
            name: "Midterm",
            graderaw: 0,
          },
        ],
      },
    ]);

    const diffs: GradeChangeDiff[] = [];

    expect(trackCourseDiff(oldData, newData)).toStrictEqual({
      diffs,
      hasDiff: false,
    });
  });

  test("trackCourseDiff: handle empty grade names and null values", () => {
    const oldData: ExtendedCourse[] = [];

    const newData: ExtendedCourse[] = fromPartial([
      {
        course_id: 1234,
        name: "Research Methods and Tools | Omirgaliyev Ruslan",
        grades: [
          { grade_id: 1, name: "", graderaw: 0 },
          { grade_id: 2, name: "Attendance", graderaw: 66.6667 },
          { grade_id: 3, name: "", graderaw: 0 },
          { grade_id: 4, name: "Register Term", graderaw: 0 },
          { grade_id: 5, name: "Ignored Grade", graderaw: null },
        ],
      },
    ]);

    const expected: GradeChangeDiff[] = [
      {
        c: "Research Methods and Tools | Omirgaliyev Ruslan",
        g: [["Attendance", null, 66.6667]],
      },
    ];

    expect(trackCourseDiff(oldData, newData)).toStrictEqual({
      diffs: expected,
      hasDiff: true,
    });
  });

  test("trackCourseDiff: handle all empty", () => {
    const oldData: ExtendedCourse[] = [];

    const newData: ExtendedCourse[] = fromPartial([
      {
        course_id: 1234,
        name: "Research Methods and Tools | Omirgaliyev Ruslan",
        grades: [
          { grade_id: 1, name: "", graderaw: 0 },
          { grade_id: 2, name: "", graderaw: 0 },
          { grade_id: 3, name: "Ignored Grade", graderaw: null },
          { grade_id: 5, name: "Ignored Grade", graderaw: null },
        ],
      },
    ]);

    const expected: GradeChangeDiff[] = [];

    expect(trackCourseDiff(oldData, newData)).toStrictEqual({
      diffs: expected,
      hasDiff: false,
    });
  });

  test("formatCourseDiffs: single", () => {
    const diffs: GradeChangeDiff[] = [
      {
        c: "Introduction to SRE | Meirmanova Aigul",
        g: [["Final exam documentation submission", null, 100]],
      },
    ];

    expect(formatCourseDiffs(diffs)).toMatchInlineSnapshot(`
      "Updated grades:

      📘 Introduction to SRE:
        - Final exam documentation submission: <b>N/A → 100</b>
      "
    `);
  });

  test("formatCourseDiffs: multiple courses and grades", () => {
    const diffs: GradeChangeDiff[] = [
      {
        c: "Course 1",
        g: [["Midterm", null, 100]],
      },
      {
        c: "Course 2",
        g: [
          ["Midterm", null, 100],
          ["Endterm", null, 100],
        ],
      },
    ];

    expect(formatCourseDiffs(diffs)).toMatchInlineSnapshot(`
      "Updated grades:

      📘 Course 1:
        - Midterm: <b>N/A → 100</b>

      📘 Course 2:
        - Midterm: <b>N/A → 100</b>
        - Endterm: <b>N/A → 100</b>
      "
    `);
  });
});

type DeadlineData = Deadline & {
  notifications: Record<string, boolean>;
};

describe("deadlines notifications", () => {
  vi.setSystemTime(new Date("2024-09-15T12:24:00"));

  test("processDeadlines: default", () => {
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
        cid: 4911,
        eid: 515515,
        c: "Research Methods and Tools | Omirgaliyev Ruslan",
        d: [["Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"]],
      },
    ];

    expect(
      processDeadlines(deadlines, ["6 hours", "12 hours", "24 hours"]),
    ).toStrictEqual(diff);
  });

  test("processDeadlines: should be able to group deadlines by course", () => {
    const deadlines: DeadlineData[] = [
      {
        event_id: 515578,
        timestart: 1726426740,
        instance: 139106,
        name: "practice 1 is due",
        visible: false,
        course_id: 4963,
        course_name: "Computer Networks | Akerke Auelbayeva",
        assignment: {
          assignment_id: 43255,
          cmid: 139106,
          duedate: 1726426740, // Sun Sep 15 2024 18:59:00 GMT+0000
          grade: null,
          gradeEntity: {
            graderaw: null,
          },
        },
        notifications: {},
      },
      {
        event_id: 123123,
        timestart: 1726426740,
        instance: 139106,
        name: "practice 2 is due",
        visible: false,
        course_id: 4963,
        course_name: "Computer Networks | Akerke Auelbayeva",
        assignment: {
          assignment_id: 43255,
          cmid: 139106,
          duedate: 1726426740,
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
        cid: 4963,
        c: "Computer Networks | Akerke Auelbayeva",
        d: [
          ["practice 1 is due", 1726426740000, "06:35:00", "12 hours"],
          ["practice 2 is due", 1726426740000, "06:35:00", "12 hours"],
        ],
        eid: 515578,
      },
    ];

    expect(
      processDeadlines(deadlines, ["6 hours", "12 hours", "24 hours"]),
    ).toStrictEqual(diff);
  });

  test("processDeadlines: should sort deadlines by due date and exclude graded assignments", () => {
    const deadlines: DeadlineData[] = [
      {
        event_id: 1,
        course_name: "Course A",
        name: "Assignment 1",
        timestart: Math.floor(Date.now() / 1000) + 3600 * 10, // 10 hours from now
        instance: 139102,
        visible: true,
        course_id: 1,
        notifications: {},
        assignment: {
          assignment_id: 1,
          cmid: 1,
          duedate: 1726426740,
          grade: 100,
          gradeEntity: {
            graderaw: 100,
          },
        },
      },
      {
        event_id: 2,
        course_name: "Course B",
        name: "Assignment 2",
        timestart: Math.floor(Date.now() / 1000) + 3600 * 8, // 8 hours from now
        instance: 139102,
        visible: true,
        course_id: 2,
        notifications: {},
      },
      {
        event_id: 3,
        course_name: "Course C",
        name: "Assignment 3",
        timestart: Math.floor(Date.now() / 1000) + 3600 * 12, // 12 hours from now
        instance: 139102,
        visible: true,
        course_id: 3,
        notifications: {},
      },
    ];

    const thresholds = ["6 hours", "12 hours", "24 hours"];

    const result = processDeadlines(deadlines, thresholds);

    expect(result).toHaveLength(2);
    expect(result[0].eid).toBe(2); // Assignment 2 should be first
    expect(result[1].eid).toBe(3); // Assignment 3 should be second
    expect(result.some((r) => r.eid === 1)).toBe(false); // Assignment 1 should be excluded
  });

  test("processDeadlines: should handle empty deadlines array", () => {
    const deadlines: DeadlineData[] = [];

    const thresholds = ["6 hours", "12 hours", "24 hours"];

    const result = processDeadlines(deadlines, thresholds);
    expect(result).toHaveLength(0);
  });

  test("processDeadlines: should handle all past deadlines", () => {
    const deadlines: DeadlineData[] = [
      {
        event_id: 1,
        course_name: "Course A",
        name: "Past Assignment",
        timestart: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        instance: 139102,
        visible: true,
        course_id: 1,
        notifications: {},
      },
    ];

    const thresholds = ["6 hours", "12 hours", "24 hours"];

    const result = processDeadlines(deadlines, thresholds);

    expect(result).toHaveLength(0);
  });

  test("processDeadlines: should not include deadlines with notifications already sent", () => {
    const deadlines: DeadlineData[] = [
      {
        event_id: 1,
        course_name: "Course A",
        name: "Assignment 1",
        timestart: Math.floor(Date.now() / 1000) + 3600 * 10, // 10 hours from now
        instance: 139102,
        visible: true,
        course_id: 1,
        notifications: { "12 hours": true },
      },
    ];

    const thresholds = ["6 hours", "12 hours", "24 hours"];

    const result = processDeadlines(deadlines, thresholds);
    expect(result).toHaveLength(0);
  });

  test("processDeadlines: should handle not started thresholds", () => {
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
    ];

    const diff: DeadlineReminderDiff[] = [];

    expect(processDeadlines(deadlines, ["6 hours"])).toStrictEqual(diff);
  });

  test("formatDeadlineReminders: multiple courses and deadlines", () => {
    const diffs: DeadlineReminderDiff[] = [
      {
        cid: 4911,
        eid: 515515,
        c: "Research Methods and Tools | Omirgaliyev Ruslan",
        d: [
          ["Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"],
          ["Assignment 2 is due", 1726426740000, "06:35:00", "12 hours"],
        ],
      },
      {
        cid: 4963,
        eid: 34123,
        c: "Writing | Barak Omaba",
        d: [["Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"]],
      },
    ];

    expect(formatDeadlineReminders(diffs)).toMatchInlineSnapshot(`
      "🔔 Upcoming deadlines 🔔

      🗓 Research Methods and Tools | Omirgaliyev Ruslan
        - Assignment 1 is due: 06:35:00, Sun, Sep 15, 2024, 18:59
        - Assignment 2 is due: 06:35:00, Sun, Sep 15, 2024, 18:59

      🗓 Writing | Barak Omaba
        - Assignment 1 is due: 06:35:00, Sun, Sep 15, 2024, 18:59

      "
    `);
  });
});
