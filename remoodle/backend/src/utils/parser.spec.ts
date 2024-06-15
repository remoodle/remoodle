import { expect, test } from "vitest";
import type { ExtendedCourse, GradeChangeEvent } from "../shims";
import { formatCourseDiffs, trackCourseDiff } from "./parser";

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
        n: "Introduction to SRE | Meirmanova Aigul",
        d: [["Final exam documentation submission", null, 100]],
      },
    ],
    hasDiff: true,
  });
});

test("formatCourseDiffs", () => {
  const event: GradeChangeEvent = {
    moodleId: 1234,
    payload: [
      {
        n: "Introduction to SRE | Meirmanova Aigul",
        d: [["Final exam documentation submission", "null", "100"]],
      },
    ],
  };

  expect(formatCourseDiffs(event.payload)).toStrictEqual(
    "Updated grades:\n\n  Introduction to SRE | Meirmanova Aigul:\n      Final exam documentation submission null -> 100\n",
  );
});
