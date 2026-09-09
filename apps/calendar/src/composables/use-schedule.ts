import type { CalendarEvent } from "@schedule-x/calendar";
import { Temporal } from "temporal-polyfill";
import { computed } from "vue";
import { useMyDuSchedule } from "@/lib/api/my-du";
import { useMoodleSchedule } from "@/lib/api/moodle";
import { moodleToCalendarEvents } from "@/lib/moodle-calendar";
import { filterMoodle } from "../../shared/moodle";
import type { ScheduleFilter } from "@/lib/types";
import { filterSchedule } from "../../shared/schedule";
import { CALENDAR_TIME_ZONE, scheduleToCalendarEvents } from "../../shared/ical";

export function useSchedule(filters: () => ScheduleFilter) {
  const query = useMyDuSchedule();
  const moodle = useMoodleSchedule();
  const items = computed(() => filterSchedule(query.data.value?.events ?? [], filters()));
  const events = computed((): CalendarEvent[] => [
    ...scheduleToCalendarEvents(items.value).map((item) => ({
      ...item,
      start: Temporal.PlainDateTime.from(item.start.replace(" ", "T")).toZonedDateTime(
        CALENDAR_TIME_ZONE,
      ),
      end: Temporal.PlainDateTime.from(item.end!.replace(" ", "T")).toZonedDateTime(
        CALENDAR_TIME_ZONE,
      ),
      calendarId: item.location === "Online" ? "online" : "offline",
    })),
    ...moodleToCalendarEvents(filterMoodle(moodle.data.value?.events ?? [], filters().moodle)),
  ]);
  const courses = computed(() => [
    ...new Set(query.data.value?.events.map((item) => item.courseName) ?? []),
  ]);
  return { ...query, moodle, items, events, courses };
}
