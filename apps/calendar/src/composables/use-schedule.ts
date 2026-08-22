import type { CalendarEvent } from "@schedule-x/calendar";
import { Temporal } from "temporal-polyfill";
import { computed } from "vue";
import { useGroupsQuery, useGroupScheduleQuery } from "@/lib/api";
import type { ScheduleFilter, ScheduleItem } from "@/lib/types";
import { CALENDAR_TIME_ZONE } from "../../shared/ical";

export function useSchedule(group: () => string, filters: () => Record<string, ScheduleFilter>) {
  const currentGroup = computed(() => group());
  const currentFilters = computed(() => filters());

  const { data: allGroups } = useGroupsQuery();
  const { data: schedule } = useGroupScheduleQuery(() => currentGroup.value);

  const daysMap: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
  };

  const getScheduleWeekStart = (): Temporal.PlainDate => {
    const today = Temporal.Now.plainDateISO(CALENDAR_TIME_ZONE);

    return today.dayOfWeek === 7
      ? today.add({ days: 1 })
      : today.subtract({ days: today.dayOfWeek - 1 });
  };

  const getTargetDateByDay = (day: string): Temporal.ZonedDateTime => {
    const [dayName, time] = day.split(" ");
    const fallback = Temporal.Now.zonedDateTimeISO(CALENDAR_TIME_ZONE).with({
      second: 0,
      millisecond: 0,
      microsecond: 0,
      nanosecond: 0,
    });

    if (!time || !dayName) {
      return fallback;
    }

    const targetWeekday = daysMap[dayName];

    if (!targetWeekday) {
      return fallback;
    }

    try {
      const targetDate = getScheduleWeekStart().add({ days: targetWeekday - 1 });
      const plainTime = Temporal.PlainTime.from(time);

      return targetDate.toZonedDateTime({
        timeZone: CALENDAR_TIME_ZONE,
        plainTime,
      });
    } catch (error) {
      console.error("Invalid schedule time", day, error);
      return fallback;
    }
  };

  const groupSchedule = computed((): CalendarEvent[] => {
    if (!currentGroup.value || !schedule.value) {
      return [];
    }

    const userGroupFilters = currentFilters.value?.[currentGroup.value];
    const currentGroupSchedule: ScheduleItem[] = schedule.value || [];

    if (!currentGroupSchedule || currentGroupSchedule.length === 0) {
      return [];
    }

    const filteredSchedule = currentGroupSchedule.filter((item: ScheduleItem) => {
      if (!userGroupFilters) {
        return true;
      }

      if (userGroupFilters.excludedCourses.length > 0) {
        if (userGroupFilters.excludedCourses.includes(item.courseName)) {
          return false;
        }
      }

      if (
        !userGroupFilters.eventTypes.learn &&
        !userGroupFilters.eventTypes.lecture &&
        !userGroupFilters.eventTypes.practice
      ) {
        return true;
      }

      if (!userGroupFilters.eventTypes.learn) {
        if (item.teacher.startsWith("https://learn")) {
          return false;
        }
      }

      if (!userGroupFilters.eventTypes.lecture) {
        if (item.type === "lecture") {
          return false;
        }
      }

      if (!userGroupFilters.eventTypes.practice) {
        if (item.type === "practice") {
          return false;
        }
      }

      if (!userGroupFilters.eventFormats.offline && !userGroupFilters.eventFormats.online) {
        return true;
      }

      if (!userGroupFilters.eventFormats.offline) {
        if (item.location !== "online") {
          return false;
        }
      }

      if (!userGroupFilters.eventFormats.online) {
        if (item.location === "online") {
          return false;
        }
      }

      return true;
    });

    // Convert the schedule to CalendarEvent format (also for the previous and next week)
    const resultSchedule: CalendarEvent[] = filteredSchedule.map((item) => {
      const calendarId = (): "online" | "offline" | "learn" => {
        if (item.teacher.startsWith("https://learn")) {
          return "learn";
        }

        if (item.location === "online") {
          return "online";
        }

        return "offline";
      };

      const newEvent = {
        id: item.id,
        title: item.courseName.length > 30 ? item.courseName.slice(0, 26) + "..." : item.courseName,
        description: `${item.teacher.startsWith("https://learn") ? "learn.astanait.edu.kz" : item.teacher}  |  ${item.location.toUpperCase()}  |  ${item.type}\n`,
      };

      const start = getTargetDateByDay(item.start);
      const end = getTargetDateByDay(item.end);

      return {
        ...newEvent,
        start,
        end,
        _customContent: {
          timeGrid: `<strong>
                      ${item.courseName.length > 30 ? item.courseName.slice(0, 26) + "..." : item.courseName}
                     </strong><br>
                     ${item.teacher}<br />
                     ${item.location.toUpperCase()}<br />`,
        },
        calendarId: calendarId(),
      };
    });

    return resultSchedule;
  });

  const groupCourses = computed(() => {
    if (!currentGroup.value) {
      return [];
    }

    const groupSchedule = schedule.value;

    if (!groupSchedule) {
      return [];
    }

    const uniqueCourses = new Set(groupSchedule.map((item) => item.courseName));

    return Array.from(uniqueCourses);
  });

  return {
    groupSchedule,
    allGroups,
    getTargetDateByDay,
    groupCourses,
  };
}
