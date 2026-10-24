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
  courses: Record<string, CourseScheduleFilter>;
  ical?: { combineAdjacentPairs?: boolean; startDate?: string; endDate?: string };
};

export type CourseScheduleFilter = {
  enabled: boolean;
  lecture: boolean;
  practice: boolean;
  online: boolean;
  offline: boolean;
};

export function defaultCourseFilter(): CourseScheduleFilter {
  return { enabled: true, lecture: true, practice: true, online: true, offline: true };
}

export function defaultFilters(): ScheduleFilter {
  return {
    classes: true,
    moodle: { attendance: false, assignment: true, other: true },
    courses: {},
  };
}

export function filterSchedule(items: ScheduleItem[], filters: ScheduleFilter) {
  if (filters.classes === false) return [];

  return items.filter((item) => {
    const course = filters.courses[item.courseName] ?? defaultCourseFilter();

    return (
      course.enabled &&
      (item.type === null || course[item.type]) &&
      course[item.isOnline ? "online" : "offline"]
    );
  });
}
