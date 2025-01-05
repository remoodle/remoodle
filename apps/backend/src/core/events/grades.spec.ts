import { describe, expect, test } from "vitest";
import type { GradeChangeDiff } from "./grades";
import { formatCourseDiffs } from "./grades";

describe("grades notifications", () => {
  test("formatCourseDiffs: single", () => {
    const diffs: GradeChangeDiff[] = [
      {
        courseId: 1234,
        courseName: "Introduction to SRE | Meirmanova Aigul",
        changes: [["Final exam documentation submission", null, 100, 100]],
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
        courseId: 1,
        courseName: "Course 1",
        changes: [["Midterm", null, 100, 100]],
      },
      {
        courseId: 2,
        courseName: "Course 2",
        changes: [
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
