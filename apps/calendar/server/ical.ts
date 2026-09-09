import type { ScheduleItem } from "../shared/schedule";
import {
  generateCalendarEventsIcal,
  mergeAdjacentCalendarEvents,
  scheduleToCalendarEvents,
} from "../shared/ical";

export function generateIcal(
  items: ScheduleItem[],
  _now = new Date(),
  options?: { combineAdjacentPairs?: boolean; rangeStart?: Date; rangeEnd?: Date },
) {
  const events = scheduleToCalendarEvents(items);
  return generateCalendarEventsIcal(
    options?.combineAdjacentPairs ? mergeAdjacentCalendarEvents(events) : events,
    options?.rangeStart,
    options?.rangeEnd,
  );
}
