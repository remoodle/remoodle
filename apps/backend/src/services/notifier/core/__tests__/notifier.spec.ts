import { describe, expect, test, vi } from "vitest";
import { fromPartial } from "@total-typescript/shoehorn";
import type { ExtendedCourse, Deadline } from "@remoodle/types";
import type { GradeChangeDiff, DeadlineReminderDiff } from "../shims";
import { trackCourseDiff, processDeadlines } from "../checker";
import { formatCourseDiffs, formatDeadlineReminders } from "../formatter";

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
        • Final exam documentation submission: <b>N/A → 100</b>
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
        • Midterm: <b>N/A → 100</b>

      📘 Course 2:
        • Midterm: <b>N/A → 100</b>
        • Endterm: <b>N/A → 100</b>
      "
    `);
  });
});

type DeadlineData = Deadline & {
  notifications: Record<string, boolean>;
};

describe("deadlines notifications", () => {
  test("processDeadlines: default", () => {
    vi.setSystemTime(new Date("2024-09-15T12:24:00"));

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

    const expected = {
      reminders: [
        {
          cid: 4911,
          eid: 515515,
          c: "Research Methods and Tools | Omirgaliyev Ruslan",
          d: [["Assignment 1 is due", 1726426740000, "06:35:00", "12 hours"]],
        },
      ],
      markedDeadlines: [
        {
          ...deadlines[0],
          notifications: { "12 hours": true },
        },
        deadlines[1],
      ],
    };

    expect(
      processDeadlines(deadlines, ["6 hours", "12 hours", "24 hours"]),
    ).toStrictEqual(expected);
  });

  test("processDeadlines: should be able to group deadlines by course", () => {
    vi.setSystemTime(new Date("2024-09-15T12:24:00"));

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

    const expected = {
      reminders: [
        {
          cid: 4963,
          c: "Computer Networks | Akerke Auelbayeva",
          d: [
            ["practice 1 is due", 1726426740000, "06:35:00", "12 hours"],
            ["practice 2 is due", 1726426740000, "06:35:00", "12 hours"],
          ],
          eid: 515578,
        },
      ],
      markedDeadlines: [
        {
          ...deadlines[0],
          notifications: { "12 hours": true },
        },
        {
          ...deadlines[1],
          notifications: { "12 hours": true },
        },
      ],
    };

    expect(
      processDeadlines(deadlines, ["6 hours", "12 hours", "24 hours"]),
    ).toStrictEqual(expected);
  });

  test("processDeadlines: should sort deadlines by due date and exclude graded assignments", () => {
    vi.setSystemTime(new Date("2024-09-15T12:24:00"));

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

    expect(result.reminders).toHaveLength(2);
    expect(result.reminders[0].eid).toBe(2); // Assignment 2 should be first
    expect(result.reminders[1].eid).toBe(3); // Assignment 3 should be second
    expect(result.reminders.some((r) => r.eid === 1)).toBe(false); // Assignment 1 should be excluded
    expect(result.markedDeadlines).toHaveLength(3);
    expect(result.markedDeadlines[1].notifications["12 hours"]).toBe(true);
    expect(result.markedDeadlines[2].notifications["12 hours"]).toBe(true);
  });

  test("processDeadlines: should handle empty deadlines array", () => {
    const deadlines: DeadlineData[] = [];
    const thresholds = ["6 hours", "12 hours", "24 hours"];
    const result = processDeadlines(deadlines, thresholds);
    expect(result.reminders).toHaveLength(0);
    expect(result.markedDeadlines).toHaveLength(0);
  });

  test("processDeadlines: should handle all past deadlines", () => {
    vi.setSystemTime(new Date("2024-09-15T12:24:00"));

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
    expect(result.reminders).toHaveLength(0);
    expect(result.markedDeadlines).toHaveLength(1);
  });

  test("processDeadlines: should not include deadlines with notifications already sent", () => {
    vi.setSystemTime(new Date("2024-09-15T12:24:00"));

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
    expect(result.reminders).toHaveLength(0);
    expect(result.markedDeadlines).toHaveLength(1);
  });

  test("processDeadlines: should handle not started thresholds", () => {
    vi.setSystemTime(new Date("2024-09-15T12:24:00"));

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

    const result = processDeadlines(deadlines, ["6 hours"]);
    expect(result.reminders).toHaveLength(0);
    expect(result.markedDeadlines).toHaveLength(1);
  });

  test("processDeadlines: should correctly process and group deadlines", () => {
    vi.setSystemTime(new Date("2024-09-25T00:00:11"));

    const deadlines: DeadlineData[] = [
      {
        event_id: 2,
        course_id: 2,
        course_name: "Machine Learning Algorithms | Ainur Mukashova",
        name: "DATASET CHOICE",
        timestart: 1727550000, // Sat, Sep 28, 2024, 24:00
        instance: 2,
        visible: true,
        notifications: {},
      },
      {
        event_id: 3,
        course_id: 2,
        course_name: "Machine Learning Algorithms | Ainur Mukashova",
        name: "Word Embeddings",
        timestart: 1727550000, // Sat, Sep 28, 2024, 24:00
        instance: 3,
        visible: true,
        notifications: {},
      },
      {
        event_id: 1,
        course_id: 1,
        course_name: "Computer Networks | Akerke Auelbayeva",
        name: "Lab 4",
        timestart: 1727636400, // Sun, Sep 29, 2024, 24:00
        instance: 1,
        visible: true,
        notifications: {},
      },
      {
        event_id: 4,
        course_id: 2,
        course_name: "Machine Learning Algorithms | Ainur Mukashova",
        name: "LINEAR REGRESSION",
        timestart: 1727636400, // Sun, Sep 29, 2024, 24:00
        instance: 4,
        visible: true,
        notifications: {},
      },
    ];

    const thresholds = ["1 day", "2 days", "3 days", "4 days", "5 days"];

    const result = processDeadlines(deadlines, thresholds);

    expect(result.reminders).toHaveLength(2); // Two courses

    // Check Machine Learning Algorithms course (should be first due to earlier deadline)
    expect(result.reminders[0].c).toBe(
      "Machine Learning Algorithms | Ainur Mukashova",
    );
    expect(result.reminders[0].d).toHaveLength(3); // Three deadlines
    expect(result.reminders[0].d[0][0]).toBe("DATASET CHOICE");
    expect(result.reminders[0].d[0][3]).toBe("4 days");
    expect(result.reminders[0].d[1][0]).toBe("Word Embeddings");
    expect(result.reminders[0].d[1][3]).toBe("4 days");
    expect(result.reminders[0].d[2][0]).toBe("LINEAR REGRESSION");
    expect(result.reminders[0].d[2][3]).toBe("5 days");

    // Check Computer Networks course (should be second due to later deadline)
    expect(result.reminders[1].c).toBe("Computer Networks | Akerke Auelbayeva");
    expect(result.reminders[1].d).toHaveLength(1); // One deadline
    expect(result.reminders[1].d[0][0]).toBe("Lab 4");
    expect(result.reminders[1].d[0][3]).toBe("5 days");

    // Check marked deadlines
    expect(result.markedDeadlines).toHaveLength(4);
    expect(result.markedDeadlines[0].notifications["4 days"]).toBe(true);
    expect(result.markedDeadlines[1].notifications["4 days"]).toBe(true);
    expect(result.markedDeadlines[2].notifications["5 days"]).toBe(true);
    expect(result.markedDeadlines[3].notifications["5 days"]).toBe(true);

    // Check the order of deadlines within the Machine Learning Algorithms course
    const mlDeadlines = result.reminders[0].d;
    expect(mlDeadlines[0][1]).toBeLessThan(mlDeadlines[2][1]); // DATASET CHOICE before LINEAR REGRESSION
    expect(mlDeadlines[1][1]).toBeLessThan(mlDeadlines[2][1]); // Word Embeddings before LINEAR REGRESSION
  });

  test("processDeadlines: should sort deadlines by date within each course", () => {
    vi.setSystemTime(new Date("2024-09-25T00:00:11")); // Set to a specific time to ensure consistent results

    const deadlines: DeadlineData[] = [
      {
        event_id: 2,
        course_id: 2,
        course_name: "Machine Learning Algorithms | Ainur Mukashova",
        name: "DATASET CHOICE",
        timestart: 1727550000, // Sat, Sep 28, 2024, 24:00
        instance: 2,
        visible: true,
        notifications: {},
      },
      {
        event_id: 3,
        course_id: 2,
        course_name: "Machine Learning Algorithms | Ainur Mukashova",
        name: "Word Embeddings",
        timestart: 1727550000, // Sat, Sep 28, 2024, 24:00
        instance: 3,
        visible: true,
        notifications: {},
      },
      {
        event_id: 1,
        course_id: 1,
        course_name: "Computer Networks | Akerke Auelbayeva",
        name: "Lab 4",
        timestart: 1727636400, // Sun, Sep 29, 2024, 24:00
        instance: 1,
        visible: true,
        notifications: {},
      },
      {
        event_id: 4,
        course_id: 2,
        course_name: "Machine Learning Algorithms | Ainur Mukashova",
        name: "LINEAR REGRESSION",
        timestart: 1727636400, // Sun, Sep 29, 2024, 24:00
        instance: 4,
        visible: true,
        notifications: {},
      },
    ];

    const thresholds = ["1 day", "2 days", "3 days", "4 days", "5 days"];

    const result = processDeadlines(deadlines, thresholds);

    console.log(result);

    expect(result.reminders).toHaveLength(2); // Two courses

    // Check Machine Learning Algorithms course (should be first due to earlier deadline)
    expect(result.reminders[0].c).toBe(
      "Machine Learning Algorithms | Ainur Mukashova",
    );
    expect(result.reminders[0].d).toHaveLength(3); // Three deadlines
    expect(result.reminders[0].d[0][0]).toBe("DATASET CHOICE");
    expect(result.reminders[0].d[1][0]).toBe("Word Embeddings");
    expect(result.reminders[0].d[2][0]).toBe("LINEAR REGRESSION");
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
        • Assignment 1 is due: <b>06:35:00</b>, Sun, Sep 15, 2024, 23:59
        • Assignment 2 is due: <b>06:35:00</b>, Sun, Sep 15, 2024, 23:59

      🗓 Writing | Barak Omaba
        • Assignment 1 is due: <b>06:35:00</b>, Sun, Sep 15, 2024, 23:59

      "
    `);
  });
});
