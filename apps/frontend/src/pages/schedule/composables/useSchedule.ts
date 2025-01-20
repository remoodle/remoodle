import { ref, computed } from "vue";
import parsedSchedule from "../3_2.json";
import type { Schedule } from "@remoodle/types";
import type { CalendarEvent } from "@schedule-x/calendar";
import dayjs from "dayjs";
import { useAppStore } from "@/shared/stores/app";
import weekday from "dayjs/plugin/weekday";
import { useScheduleStore } from "@/shared/stores/schedule";

export function useSchedule() {
  const allSchedules = ref<Schedule>(parsedSchedule as Schedule);

  const allGroups = computed(() =>
    Object.keys(allSchedules.value).sort().reverse(),
  );

  dayjs.extend(weekday);

  const getTargetDateByDay = (day: string): Date => {
    const [dayName, time] = day.split(" ");

    const daysMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const now = dayjs();
    const targetWeekday = daysMap[dayName];
    const targetDate = now.weekday(targetWeekday);

    const [hours, minutes] = time.split(":").map(Number);

    return targetDate
      .hour(hours)
      .minute(minutes)
      .second(0)
      .millisecond(0)
      .toDate();
  };

  const convertToDateTime = (date: Date): string => {
    // Format 'Y-m-d HH:mm'
    return date
      .toLocaleString("sv-SE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(" ", "T")
      .slice(0, 16)
      .replace("T", " ");
  };

  const groupSchedule = computed((): CalendarEvent[] => {
    const appStore = useAppStore();
    // const scheduleStore = useScheduleStore();
    const group = appStore.group ?? "SE-2203";
    // const userGroupFilters = scheduleStore.filters[group];
    // console.log(userGroupFilters);
    const groupSchedule = allSchedules.value[group];

    // Convert the schedule to CalendarEvent format (also for the previous and next week)
    const resultSchedule: CalendarEvent[] = groupSchedule.map((item) => {
      const calendarId = (): "online" | "offline" | "learn" => {
        if (item.teacher.startsWith("https://")) {
          return "learn";
        }

        if (item.location === "online") {
          return "online";
        }

        return "offline";
      };
      const newEvent = {
        id: item.id,
        title:
          item.courseName.length > 30
            ? item.courseName.slice(0, 26) + "..."
            : item.courseName,
        description: `${item.teacher.startsWith("https://learn") ? "learn.astanait.edu.kz" : item.teacher}  |  ${item.location.toUpperCase()}  |  ${item.type}\n`,
        // rrule: "FREQ=WEEKLY;COUNT=1",
      };

      const startBaseDate = getTargetDateByDay(item.start);
      const start = convertToDateTime(startBaseDate);
      const end = convertToDateTime(
        new Date(new Date(start).setMinutes(startBaseDate.getMinutes() + 50)),
      );

      return {
        ...newEvent,
        start: start,
        end: end,
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
    const appStore = useAppStore();
    const group = appStore.group ?? "SE-2203";
    const groupSchedule = allSchedules.value[group];

    const uniqueCourses = new Set(groupSchedule.map((item) => item.courseName));
    return Array.from(uniqueCourses);
  });

  return {
    groupSchedule,
    allGroups,
    getTargetDateByDay,
    convertToDateTime,
    groupCourses,
  };
}
