import { describe, expect, test } from "vite-plus/test";
import { defaultFilters, filterSchedule, type ScheduleItem } from "./schedule";

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
    filters.eventTypes.lecture = false;

    expect(filterSchedule([lecture, practice], filters)).toEqual([practice]);
  });

  test("filters practical classes independently", () => {
    const filters = defaultFilters();
    filters.eventTypes.practice = false;

    expect(filterSchedule([lecture, practice], filters)).toEqual([lecture]);
  });
});
