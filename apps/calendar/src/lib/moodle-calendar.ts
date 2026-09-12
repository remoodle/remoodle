import type { CalendarEvent } from "@schedule-x/calendar";
import { Temporal } from "temporal-polyfill";
import type { MoodleEvent } from "../../shared/moodle";
import { CALENDAR_TIME_ZONE } from "../../shared/ical";

function scheduleSafeId(value: string) {
  return (
    "moodle-event-" +
    Array.from(value, (character) => character.codePointAt(0)!.toString(36)).join("-")
  );
}

export function moodleToCalendarEvents(events: MoodleEvent[]): CalendarEvent[] {
  return events.map((event) => {
    const point = !event.allDay && event.start === event.end;
    // Zero-duration deadlines belong in the date row, not an invisible time-grid
    // rectangle. Keep the actual deadline in the label and export metadata.
    const dateRow = event.allDay || point;

    const start = dateRow
      ? Temporal.PlainDate.from(event.start.slice(0, 10))
      : Temporal.PlainDateTime.from(event.start).toZonedDateTime(CALENDAR_TIME_ZONE);

    const end = dateRow
      ? event.allDay && event.end > event.start
        ? Temporal.PlainDate.from(event.end).subtract({ days: 1 })
        : Temporal.PlainDate.from(event.start.slice(0, 10))
      : Temporal.PlainDateTime.from(event.end).toZonedDateTime(CALENDAR_TIME_ZONE);

    return {
      // Normalize at render time too, so rows imported before IDs were encoded
      // do not crash Schedule-X and do not require users to reconnect.
      id: scheduleSafeId(event.id),
      start,
      end,
      title: point ? event.start.slice(11, 16) + " · " + event.title : event.title,
      description: [event.courseName, event.description].filter(Boolean).join("\n\n"),
      calendarId: "moodle-" + event.kind,
      moodleEvent: event,
    };
  });
}
