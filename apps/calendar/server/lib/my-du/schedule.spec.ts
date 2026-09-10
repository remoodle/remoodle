import { describe, expect, test } from "vite-plus/test";
import { normalizeWeek } from "./schedule";

const settings = { studyYear: 2026, term: 1, firstWeekStart: "2026-09-07" };

function responseWithLessonType(lessonType: string) {
  return {
    studyYear: 2026,
    term: 1,
    weekNumber: 1,
    slots: [
      {
        weekDay: { id: 4 },
        items: [
          {
            uid: 1,
            classTime: { id: 1, title: "19:00 – 19:50" },
            subjectName: "Applied Software Development Project",
            lessonType,
            online: false,
            classroom: "C1.3.255L",
            building: "Main Campus",
            teacherName: "Teacher",
          },
        ],
      },
    ],
  };
}

describe("normalizeWeek", () => {
  test.each([
    ["Lectures", "lecture"],
    ["Practical classes", "practice"],
  ] as const)("maps %s to the %s filter", (lessonType, type) => {
    expect(normalizeWeek(responseWithLessonType(lessonType), settings, 1)[0]?.type).toBe(type);
  });
});
