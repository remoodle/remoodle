import type { ScheduleItem } from "../shared/schedule";
import { moodleToIcalEvents, type MoodleEvent } from "../shared/moodle";
import {
  generateCalendarEventsIcal,
  mergeAdjacentCalendarEvents,
  scheduleToCalendarEvents,
} from "../shared/ical";

export function generateIcal(
  items: ScheduleItem[],
  _now = new Date(),
  options?: {
    combineAdjacentPairs?: boolean;
    rangeStart?: Date;
    rangeEnd?: Date;
    moodleEvents?: MoodleEvent[];
  },
) {
  const events = scheduleToCalendarEvents(items);
  return generateCalendarEventsIcal(
    [
      ...(options?.combineAdjacentPairs ? mergeAdjacentCalendarEvents(events) : events),
      ...moodleToIcalEvents(options?.moodleEvents ?? []),
    ],
    options?.rangeStart,
    options?.rangeEnd,
  );
}
