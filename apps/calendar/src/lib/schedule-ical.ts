import type { CalendarEvent } from "@schedule-x/calendar";
import { Temporal } from "temporal-polyfill";
import { generateCalendarEventsIcal, mergeAdjacentCalendarEvents } from "../../shared/ical";

function toCalendarEventDateTime(value: CalendarEvent["start"]) {
  if (!value) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return `${value.toPlainDate().toString()} ${value.toPlainTime().toString({ smallestUnit: "minute" })}`;
  }

  if (value instanceof Temporal.PlainDate) {
    return `${value.toString()} 00:00`;
  }

  return undefined;
}

export function createScheduleIcal(
  events: CalendarEvent[],
  startDate: string,
  endDate: string,
  combineAdjacentPairs: boolean,
) {
  const normalizedEvents = events.map((event) => ({
    ...event,
    start: toCalendarEventDateTime(event.start),
    end: toCalendarEventDateTime(event.end),
  }));
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T23:59:59Z`);
  const sourceEvents = combineAdjacentPairs
    ? mergeAdjacentCalendarEvents(normalizedEvents)
    : normalizedEvents;

  return generateCalendarEventsIcal(
    sourceEvents
      .filter(
        (
          event,
        ): event is typeof event & {
          title: string;
          description: string;
          start: string;
        } => Boolean(event.title && event.description && event.start),
      )
      .map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        location: typeof event.location === "string" ? event.location : "",
      })),
    start,
    end,
  );
}
