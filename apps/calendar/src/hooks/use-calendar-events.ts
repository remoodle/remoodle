import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { filterMoodle } from "@remoodle/shared/moodle";
import { filterSchedule } from "@remoodle/shared/schedule";
import { moodleEvents, scheduleEvents } from "@/lib/calendar-events";
import { moodleQuery, myDuQuery } from "@/lib/queries";
import { useFilters } from "./use-filters";

/** Both sources, filtered by the stored preferences, as one list of calendar events. */
export function useCalendarEvents() {
  const myDu = useQuery(myDuQuery);
  const moodle = useQuery(moodleQuery);
  const { filters } = useFilters();

  const classes = useMemo(
    () => scheduleEvents(filterSchedule(myDu.data?.events ?? [], filters)),
    [myDu.data, filters],
  );

  const events = useMemo(
    () => [...classes, ...moodleEvents(filterMoodle(moodle.data?.events ?? [], filters.moodle))],
    [classes, moodle.data, filters.moodle],
  );

  const courses = useMemo(
    () => [...new Set(myDu.data?.events.map((item) => item.courseName))].sort(),
    [myDu.data],
  );

  return { myDu, moodle, events, classes, courses };
}
