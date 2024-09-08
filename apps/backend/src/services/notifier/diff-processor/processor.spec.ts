import { describe, expect, test, vi } from "vitest";
import type { ExtendedCourse, Deadline } from "@remoodle/types";
import type { GradeChangeDiff, DeadlineReminderDiff } from "./shims";
import { trackCourseDiff, processDeadlines } from "./checker";
import { formatCourseDiffs, formatDeadlineReminders } from "./formatter";

describe("grades notifications", () => {
  test("trackCourseDiff: default behavior", () => {
    const oldData: ExtendedCourse[] = [
      {
        course_id: 4496,
        name: "Introduction to SRE | Meirmanova Aigul",
        coursecategory: "Trimester 3",
        url: "https://moodle.astanait.edu.kz/course/view.php?id=4496",
        start_date: 1719792000,
        end_date: 1710720000,
        grades: [
          {
            id: 3863,
            grade_id: 89083,
            cmid: 131479,
            name: "Final exam documentation submission",
            percentage: null,
            itemtype: "mod",
            itemmodule: "assign",
            iteminstance: 40432,
            grademin: 0,
            grademax: 100,
            feedbackformat: 0,
            graderaw: null,
            feedback: "",
          },
        ],
      },
    ];

    const newData: ExtendedCourse[] = [
      {
        course_id: 4496,
        name: "Introduction to SRE | Meirmanova Aigul",
        coursecategory: "Trimester 3",
        url: "https://moodle.astanait.edu.kz/course/view.php?id=4496",
        start_date: 1719792000,
        end_date: 1710720000,
        grades: [
          {
            id: 3863,
            grade_id: 89083,
            cmid: 131479,
            name: "Final exam documentation submission",
            percentage: null,
            itemtype: "mod",
            itemmodule: "assign",
            iteminstance: 40432,
            grademin: 0,
            grademax: 100,
            feedbackformat: 0,
            graderaw: 100,
            feedback: "",
          },
        ],
      },
    ];

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

    const newData: ExtendedCourse[] = [
      {
        course_id: 4496,
        name: "Introduction to SRE | Meirmanova Aigul",
        coursecategory: "Trimester 3",
        url: "https://moodle.astanait.edu.kz/course/view.php?id=4496",
        start_date: 1719792000,
        end_date: 1710720000,
        grades: [
          {
            id: 3863,
            grade_id: 89083,
            cmid: 131479,
            name: "Final exam documentation submission",
            percentage: null,
            itemtype: "mod",
            itemmodule: "assign",
            iteminstance: 40432,
            grademin: 0,
            grademax: 100,
            feedbackformat: 0,
            graderaw: null,
            feedback: "",
          },
        ],
      },
    ];

    const diffs: GradeChangeDiff[] = [];

    expect(trackCourseDiff(oldData, newData)).toStrictEqual({
      diffs,
      hasDiff: false,
    });
  });

  test("trackCourseDiff: handle empty grade names and null values", () => {
    const oldData: ExtendedCourse[] = [];
    const newData: ExtendedCourse[] = [
      {
        course_id: 1234,
        name: "Research Methods and Tools | Omirgaliyev Ruslan",
        coursecategory: "Some Category",
        url: "https://example.com",
        start_date: 1234567890,
        end_date: 1234567899,
        grades: [
          {
            id: 1,
            grade_id: 1,
            cmid: 10001,
            name: "",
            percentage: null,
            itemtype: "mod",
            itemmodule: "assign",
            iteminstance: 20001,
            grademin: 0,
            grademax: 100,
            graderaw: 0,
            feedbackformat: 1,
            feedback: "",
          },
          {
            id: 2,
            grade_id: 2,
            cmid: 10002,
            name: "Attendance",
            percentage: null,
            itemtype: "mod",
            itemmodule: "assign",
            iteminstance: 20002,
            grademin: 0,
            grademax: 100,
            graderaw: 66.6667,
            feedbackformat: 1,
            feedback: "",
          },
          {
            id: 3,
            grade_id: 3,
            cmid: 10003,
            name: "",
            percentage: null,
            itemtype: "mod",
            itemmodule: "assign",
            iteminstance: 20003,
            grademin: 0,
            grademax: 100,
            graderaw: 0,
            feedbackformat: 1,
            feedback: "",
          },
          {
            id: 4,
            grade_id: 4,
            cmid: 10004,
            name: "Register Term",
            percentage: null,
            itemtype: "mod",
            itemmodule: "assign",
            iteminstance: 20004,
            grademin: 0,
            grademax: 100,
            graderaw: 0,
            feedbackformat: 1,
            feedback: "",
          },
          {
            id: 5,
            grade_id: 5,
            cmid: 10005,
            name: "Ignored Grade",
            percentage: null,
            itemtype: "mod",
            itemmodule: "assign",
            iteminstance: 20005,
            grademin: 0,
            grademax: 100,
            graderaw: null,
            feedbackformat: 1,
            feedback: "",
          },
        ],
      },
    ];

    const expected: GradeChangeDiff[] = [
      {
        c: "Research Methods and Tools | Omirgaliyev Ruslan",
        g: [
          ["Attendance", null, 66.6667],
          ["Register Term", null, 0],
        ],
      },
    ];

    expect(trackCourseDiff(oldData, newData)).toStrictEqual({
      diffs: expected,
      hasDiff: true,
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

      Introduction to SRE:
            Final exam documentation submission <b>null → 100</b>
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

      Course 1:
            Midterm <b>null → 100</b>

      Course 2:
            Midterm <b>null → 100</b>
            Endterm <b>null → 100</b>
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
          grade: 100,
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
          grade: 100,
        },
        notifications: {},
      },
    ];

    const diff: DeadlineReminderDiff[] = [
      {
        eid: 515515,
        c: "Research Methods and Tools | Omirgaliyev Ruslan",
        d: [["Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"]],
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
        c: "Research Methods and Tools | Omirgaliyev Ruslan",
        d: [["Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"]],
      },
    ];

    expect(formatDeadlineReminders(diffs)).toMatchInlineSnapshot(`
      "Upcoming deadlines:

        Research Methods and Tools | Omirgaliyev Ruslan:
            Assignment 1 is due
            Sunday, September 15, 2024 at 06:59 PM
            Remaining: 06:35:00
            ___threshold: 12 hours

      "
    `);
  });
});
