import type { ScheduleItem } from "./items";

// The bot's per-user class filters, stored on the user row. The calendar's iCal
// subscriptions use `ScheduleFilter` from ./items instead.
export type ScheduleFilters = {
  eventTypes: { lecture: boolean; practice: boolean; learn: boolean };
  eventFormats: { online: boolean; offline: boolean };
  courses?: Record<string, CourseScheduleFilters>;
  combineAdjacentPairs?: boolean;
};

export type CourseScheduleFilters = {
  lecture: boolean;
  practice: boolean;
  online: boolean;
  offline: boolean;
};

export const DEFAULT_COURSE_SCHEDULE_FILTERS: CourseScheduleFilters = {
  lecture: true,
  practice: true,
  online: true,
  offline: true,
};

export const DEFAULT_SCHEDULE_FILTERS: ScheduleFilters = {
  eventTypes: { lecture: true, practice: true, learn: true },
  eventFormats: { online: true, offline: true },
  combineAdjacentPairs: true,
};

export function normalizeScheduleFilters(
  filters?: Partial<ScheduleFilters> | null,
): ScheduleFilters {
  return {
    eventTypes: {
      ...DEFAULT_SCHEDULE_FILTERS.eventTypes,
      ...filters?.eventTypes,
    },
    eventFormats: {
      ...DEFAULT_SCHEDULE_FILTERS.eventFormats,
      ...filters?.eventFormats,
    },
    courses: filters?.courses ?? {},
    combineAdjacentPairs:
      filters?.combineAdjacentPairs ?? DEFAULT_SCHEDULE_FILTERS.combineAdjacentPairs,
  };
}

export function applyScheduleFilters<T extends ScheduleItem>(
  items: T[],
  filters: ScheduleFilters,
  excludedCourses: string[],
): T[] {
  return items.filter((item) => {
    if (excludedCourses.includes(item.courseName)) {
      return false;
    }

    const isLearn = item.teacher.startsWith("https://learn");

    if (isLearn && !filters.eventTypes.learn) {
      return false;
    }

    const course = filters.courses?.[item.courseName] ?? DEFAULT_COURSE_SCHEDULE_FILTERS;

    if (!isLearn && item.type === "lecture" && !course.lecture) {
      return false;
    }

    if (!isLearn && item.type === "practice" && !course.practice) {
      return false;
    }

    if (item.isOnline && !course.online) {
      return false;
    }

    if (!item.isOnline && !course.offline) {
      return false;
    }

    return true;
  });
}
