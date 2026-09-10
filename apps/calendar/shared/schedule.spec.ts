import { describe, expect, test } from "vite-plus/test";
import { defaultCourseFilter, defaultFilters, filterSchedule, type ScheduleItem } from "./schedule";

const lecture: ScheduleItem = {
  id: "lecture",
  start: "2026-09-10 19:00",
  end: "2026-09-10 19:50",
  courseName: "Applied Software Development Project",
  location: "C1.3.255L · Main Campus",
  isOnline: false,
  teacher: "Teacher",
  type: "lecture",
  lessonType: "Lectures",
};

const practice: ScheduleItem = {
  ...lecture,
  id: "practice",
  type: "practice",
  lessonType: "Practical classes",
};

describe("filterSchedule", () => {
  test("filters lectures independently", () => {
    const filters = defaultFilters();
    filters.courses[lecture.courseName] = { ...defaultCourseFilter(), lecture: false };

    expect(filterSchedule([lecture, practice], filters)).toEqual([practice]);
  });

  test("filters practical classes independently", () => {
    const filters = defaultFilters();
    filters.courses[lecture.courseName] = { ...defaultCourseFilter(), practice: false };

    expect(filterSchedule([lecture, practice], filters)).toEqual([lecture]);
  });

  test("applies event type and format filters to one course only", () => {
    const otherLecture = { ...lecture, id: "other", courseName: "Fault tolerance" };
    const onlinePractice = { ...practice, id: "online", isOnline: true };
    const filters = defaultFilters();
    filters.courses[lecture.courseName] = {
      ...defaultCourseFilter(),
      lecture: false,
      online: false,
    };

    expect(filterSchedule([lecture, practice, onlinePractice, otherLecture], filters)).toEqual([
      practice,
      otherLecture,
    ]);
  });

  test("disables a whole course without losing its detailed filters", () => {
    const filters = defaultFilters();
    filters.courses[lecture.courseName] = {
      ...defaultCourseFilter(),
      enabled: false,
      practice: false,
    };

    expect(filterSchedule([lecture, practice], filters)).toEqual([]);
    expect(filters.courses[lecture.courseName]?.practice).toBe(false);
  });
});
