import { Temporal } from "temporal-polyfill";
import type { MoodleEvent } from "@remoodle/shared/moodle";
import type { ScheduleItem } from "@remoodle/shared/schedule";

export type EventKind = "lecture" | "online" | "practice" | "assignment" | "quiz" | "attendance";

/**
 * One calendar entry. Times are wall-clock times in Kazakhstan (`CALENDAR_TIME_ZONE`), the zone
 * every source speaks, so the browser's own time zone never moves a class.
 */
export type CalendarEvent = {
  id: string;
  kind: EventKind;
  title: string;
  start: Temporal.PlainDateTime;
  end: Temporal.PlainDateTime;
  // Date-row events: all-day ranges (inclusive `end` date) and zero-length deadlines.
  dateRow: boolean;
  // The deadline time shown in a date-row entry, e.g. "23:59".
  deadline: string | null;
  location: string;
  details: string[];
};

// "2026-09-07 09:00" and "2026-09-07T09:00:00" both parse.
function wallClock(value: string) {
  return Temporal.PlainDateTime.from(value.replace(" ", "T"));
}

export function scheduleEvents(items: ScheduleItem[]): CalendarEvent[] {
  return items.map((item) => ({
    id: `my-du-${item.id}`,
    kind: item.type === "lecture" ? "lecture" : item.isOnline ? "online" : "practice",
    title: item.courseName,
    start: wallClock(item.start),
    end: wallClock(item.end),
    dateRow: false,
    deadline: null,
    location: item.location,
    details: [item.lessonType, item.teacher].filter(Boolean),
  }));
}

const moodleKindToEventKind = {
  assignment: "assignment",
  other: "quiz",
  attendance: "attendance",
} as const satisfies Record<MoodleEvent["kind"], EventKind>;

export function moodleEvents(events: MoodleEvent[]): CalendarEvent[] {
  return events.map((event) => {
    // A deadline has no duration; an invisible sliver in the time grid helps nobody.
    const point = !event.allDay && event.start === event.end;

    const start = event.allDay
      ? Temporal.PlainDate.from(event.start).toPlainDateTime()
      : wallClock(event.start);

    // Moodle's all-day ends are exclusive; the calendar stores the last day it covers.
    const end = event.allDay
      ? event.end > event.start
        ? Temporal.PlainDate.from(event.end).subtract({ days: 1 }).toPlainDateTime()
        : start
      : wallClock(event.end);

    return {
      id: `moodle-${event.id}`,
      kind: moodleKindToEventKind[event.kind],
      title: event.title,
      start,
      end,
      dateRow: event.allDay || point,
      deadline: point ? start.toPlainTime().toString({ smallestUnit: "minute" }) : null,
      location: "",
      details: [event.courseName, event.description].filter(Boolean),
    };
  });
}
