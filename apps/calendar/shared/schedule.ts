export type ScheduleItem = {
  id: string;
  // Local date and time in Asia/Almaty, never an indefinitely repeating weekday.
  start: string;
  end: string;
  courseName: string;
  location: string;
  isOnline: boolean;
  teacher: string;
  type: "lecture" | "practice" | null;
  lessonType: string;
};

export type ScheduleFilter = {
  classes?: boolean;
  moodle?: import("./moodle").MoodleFilters;
  eventTypes: { lecture: boolean; practice: boolean; learn: boolean };
  eventFormats: { online: boolean; offline: boolean };
  excludedCourses: string[];
  ical?: { combineAdjacentPairs?: boolean; startDate?: string; endDate?: string };
};

export function defaultFilters(): ScheduleFilter {
  return {
    classes: true,
    moodle: { attendance: false, assignment: true, other: true },
    eventTypes: { lecture: true, practice: true, learn: true },
    eventFormats: { online: true, offline: true },
    excludedCourses: [],
  };
}

export function filterSchedule(items: ScheduleItem[], filters: ScheduleFilter) {
  if (filters.classes === false) return [];
  return items.filter(
    (item) =>
      !filters.excludedCourses.includes(item.courseName) &&
      (item.type === null || filters.eventTypes[item.type]) &&
      filters.eventFormats[item.isOnline ? "online" : "offline"],
  );
}
