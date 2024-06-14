import { expect, test } from "vitest";
import { trackCourseDiff } from "./parser";
import type { ExtendedCourse } from "./types";

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

  expect(trackCourseDiff(oldData, newData)).toStrictEqual({
    diffs: [
      {
        course: "Introduction to SRE | Meirmanova Aigul",
        grades: [
          {
            name: "Final exam documentation submission",
            previous: null,
            updated: 100,
          },
        ],
      },
    ],
    hasDiff: true,
  });
});
