import { ref, computed } from "vue";
import parsedSchedule from "../3_2.json";
import type { Schedule } from "../types";
import type { CalendarEvent } from "@schedule-x/calendar";

export function useSchedule(group: string) {
  const allSchedules = ref<Schedule>(parsedSchedule as Schedule);

  const getTargetDateByDay = (day: string): Date => {
    const [dayName, time] = day.split(" ");

    const daysMap: { [key: string]: number } = {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 0,
    };

    const now = new Date();
    const todayWeekday = now.getDay(); // 0-indexed weekday

    const targetWeekday = daysMap[dayName];
    const daysAhead = (targetWeekday - todayWeekday + 7) % 7;

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + daysAhead);

    const [hours, minutes] = time.split(":").map(Number);
    targetDate.setHours(hours, minutes, 0, 0);

    return targetDate;
  };

  const convertToDateTime = (dates: Date[]): string[] => {
    // Format as 'Y-m-d HH:mm'
    const formattedDate = dates.map((date) => {
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
    });

    return formattedDate;
  };

  const groupSchedule = computed((): CalendarEvent[] => {
    const groupSchedule = allSchedules.value[group];

    // Convert the schedule to CalendarEvent format (also for the previous and next week)
    const resultSchedule: CalendarEvent[] = groupSchedule.flatMap((item) => {
      const baseEvent = {
        id: item.id,
        title: item.courseName,
        description: `Teacher: ${item.teacher}\n
                      ${item.location === "online" ? "Online" : "Location: " + item.location + "\n"}
                      Type: ${item.type}\n`,
      } as CalendarEvent;

      const startBaseDate = getTargetDateByDay(item.start);
      const [startCurrentWeek, startPrevWeek, startNextWeek] =
        convertToDateTime([
          startBaseDate,
          new Date(
            startBaseDate.setDate(
              startBaseDate.getDate() - 7 < 0 ? 0 : startBaseDate.getDate() - 7,
            ),
          ),
          new Date(startBaseDate.getDate() + 14),
        ]);

      const [endCurrentWeek, endPrevWeek, endNextWeek] = convertToDateTime([
        new Date(
          new Date(startCurrentWeek).setHours(startBaseDate.getHours() + 1),
        ),
        new Date(
          new Date(startPrevWeek).setHours(startBaseDate.getHours() + 1),
        ),
        new Date(
          new Date(startNextWeek).setHours(startBaseDate.getHours() + 1),
        ),
      ]);

      return [
        {
          ...baseEvent,
          start: startCurrentWeek,
          end: endCurrentWeek,
        },
        // {
        //   ...baseEvent,
        //   start: startNextWeek,
        //   end: endNextWeek,
        // },
        // {
        //   ...baseEvent,
        //   start: startPrevWeek,
        //   end: endPrevWeek,
        // },
      ];
    });

    return resultSchedule;
  });

  return {
    groupSchedule,
  };
}
