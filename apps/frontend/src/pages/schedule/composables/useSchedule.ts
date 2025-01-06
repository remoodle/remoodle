import { ref, computed } from "vue";
import parsedSchedule from "../3_2.json";
import type { Schedule } from "../types";
import type { CalendarEvent } from "@schedule-x/calendar";

export function useSchedule(group: string) {
  const allSchedules = ref<Schedule>(parsedSchedule as Schedule);

  const allGroups = computed(() => Object.keys(allSchedules.value));

  const getTargetDateByDay = (day: string): Date => {
    if (day === "Sunday") {
      return new Date();
    }

    const [dayName, time] = day.split(" ");

    const daysMap: { [key: string]: number } = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const now = new Date();
    const todayWeekday = now.getDay();

    const targetWeekday = daysMap[dayName];
    const daysAhead = (targetWeekday - todayWeekday + 7) % 7;

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysAhead);

    const [hours, minutes] = time.split(":").map(Number);
    targetDate.setHours(hours, minutes, 0, 0);

    return targetDate;
  };

  const convertToDateTime = (date: Date): string => {
    // Format as 'Y-m-d HH:mm'
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
      const newEvent = {
        id: item.id,
        title: item.courseName,
        description: `Teacher: ${item.teacher}\n
                      ${item.location === "online" ? "Online" : "Location: " + item.location + "\n"}
                      Type: ${item.type}\n`,
        rrule: "FREQ=WEEKLY;COUNT=10",
      };

      const startBaseDate = getTargetDateByDay(item.start);
      const start = convertToDateTime(startBaseDate);
      const end = convertToDateTime(
        new Date(new Date(start).setHours(startBaseDate.getHours() + 1)),
      );

      return [
        {
          ...newEvent,
          start: start,
          end: end,
        },
      ];
    });

    return resultSchedule;
  });

  return {
    groupSchedule,
    allGroups,
  };
}
