import type { ScheduleItem } from "../../shared/schedule";
import {
  generateCalendarEventsIcal,
  mergeAdjacentCalendarEvents,
  scheduleToCalendarEvents,
} from "../../shared/ical";

export function generateIcal(
  items: ScheduleItem[],
  options?: {
    combineAdjacentPairs?: boolean;
    rangeStart?: string;
    rangeEnd?: string;
  },
) {
  const events = scheduleToCalendarEvents(items);
  return generateCalendarEventsIcal(
    options?.combineAdjacentPairs ? mergeAdjacentCalendarEvents(events) : events,
    options?.rangeStart,
    options?.rangeEnd,
  );
}
