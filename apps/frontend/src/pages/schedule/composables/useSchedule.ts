import { ref, computed } from "vue";
import parsedSchedule from "../3_2.json";
import type { Schedule } from "../types";
import type { CalendarEvent } from "@schedule-x/calendar";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";

export function useSchedule(group: string) {
  const allSchedules = ref<Schedule>(parsedSchedule as Schedule);

  const allGroups = computed(() => Object.keys(allSchedules.value));

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
    const groupSchedule = allSchedules.value[group];

    // Convert the schedule to CalendarEvent format (also for the previous and next week)
    const resultSchedule: CalendarEvent[] = groupSchedule.flatMap((item) => {
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
        title: item.courseName,
        description: `Teacher: ${item.teacher}\n
                      ${item.location === "online" ? "Online" : "Location: " + item.location + "\n"}
                      Type: ${item.type}\n`,
        rrule: "FREQ=WEEKLY;COUNT=1",
      };

      const startBaseDate = getTargetDateByDay(item.start);
      const start = convertToDateTime(startBaseDate);
      const end = convertToDateTime(
        new Date(new Date(start).setMinutes(startBaseDate.getMinutes() + 50)),
      );

      return [
        {
          ...newEvent,
          start: start,
          end: end,
          calendarId: calendarId(),
        },
      ];
    });

    return resultSchedule;
  });

  return {
    groupSchedule,
    allGroups,
    getTargetDateByDay,
    convertToDateTime,
  };
}
