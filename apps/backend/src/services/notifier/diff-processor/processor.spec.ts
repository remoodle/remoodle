import { expect, test } from "vitest";
import type { ExtendedCourse } from "@remoodle/types";
import type { GradeChangeEvent, GradeChangeDiff } from "./shims";
import { trackCourseDiff } from "./checker";
import { formatCourseDiffs } from "./formatter";

test("trackCourseDiff", () => {
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

test("formatCourseDiffs", () => {
  const event: GradeChangeEvent = {
    userId: "1234",
    moodleId: 1234,
    payload: [
      {
        c: "Introduction to SRE | Meirmanova Aigul",
        g: [["Final exam documentation submission", null, 100]],
      },
    ],
  };

  expect(formatCourseDiffs(event.payload)).toMatchInlineSnapshot(`
    "Updated grades:

      Introduction to SRE | Meirmanova Aigul:
          Final exam documentation submission - -> 100
    "
  `);
});
