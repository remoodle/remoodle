import { Temporal } from "temporal-polyfill";
import { CALENDAR_TIME_ZONE } from "@remoodle/library/ical";
import type { CalendarEvent } from "./calendar-events";

export const LOCALE = "en-GB";

// The time grid covers the teaching day; nothing at AITU starts before eight.
export const DAY_START_HOUR = 8;

export const DAY_END_HOUR = 24;

export function today() {
  return Temporal.Now.plainDateISO(CALENDAR_TIME_ZONE);
}

export function now() {
  return Temporal.Now.plainDateTimeISO(CALENDAR_TIME_ZONE);
}

export function startOfWeek(date: Temporal.PlainDate) {
  return date.subtract({ days: date.dayOfWeek - 1 });
}

export function weekDays(date: Temporal.PlainDate) {
  const monday = startOfWeek(date);

  return Array.from({ length: 7 }, (_, index) => monday.add({ days: index }));
}

/** Monday-first weeks covering the whole month of `date`. */
export function monthWeeks(date: Temporal.PlainDate) {
  const first = date.with({ day: 1 });
  const last = date.with({ day: date.daysInMonth });
  const weeks: Temporal.PlainDate[][] = [];

  for (
    let monday = startOfWeek(first);
    Temporal.PlainDate.compare(monday, last) <= 0;
    monday = monday.add({ weeks: 1 })
  ) {
    weeks.push(weekDays(monday));
  }

  return weeks;
}

export function isSameDay(a: Temporal.PlainDate, b: Temporal.PlainDate) {
  return a.equals(b);
}

function startDate(event: CalendarEvent) {
  return event.start.toPlainDate();
}

// Timed events that end exactly at midnight belong to the day they started.
function endDate(event: CalendarEvent) {
  const end = event.end.toPlainDate();

  return !event.dateRow &&
    event.end.hour === 0 &&
    event.end.minute === 0 &&
    end.since(startDate(event)).days > 0
    ? end.subtract({ days: 1 })
    : end;
}

export function occursOn(event: CalendarEvent, day: Temporal.PlainDate) {
  return (
    Temporal.PlainDate.compare(startDate(event), day) <= 0 &&
    Temporal.PlainDate.compare(endDate(event), day) >= 0
  );
}

export function compareEvents(a: CalendarEvent, b: CalendarEvent) {
  return (
    Temporal.PlainDateTime.compare(a.start, b.start) || Temporal.PlainDateTime.compare(b.end, a.end)
  );
}

export function eventsOn(events: CalendarEvent[], day: Temporal.PlainDate) {
  return events.filter((event) => occursOn(event, day)).sort(compareEvents);
}

export function isPast(event: CalendarEvent, at = now()) {
  const end = event.dateRow && !event.deadline ? event.end.add({ days: 1 }) : event.end;

  return Temporal.PlainDateTime.compare(end, at) < 0;
}

/** Minutes since the grid's first hour, clamped to the grid. */
export function gridMinutes(time: Temporal.PlainDateTime | Temporal.PlainTime) {
  const minutes = (time.hour - DAY_START_HOUR) * 60 + time.minute;

  return Math.min(Math.max(minutes, 0), (DAY_END_HOUR - DAY_START_HOUR) * 60);
}

export type PositionedEvent = {
  event: CalendarEvent;
  top: number;
  height: number;
  column: number;
  columns: number;
};

/**
 * Lays out one day's timed events: overlapping events share the width in columns, each cluster
 * of overlaps sized independently. Returned positions are in minutes from the grid start.
 */
export function layoutDay(events: CalendarEvent[], day: Temporal.PlainDate): PositionedEvent[] {
  const timed = events
    .filter((event) => !event.dateRow && occursOn(event, day))
    .sort(compareEvents);

  const positioned: PositionedEvent[] = [];
  let cluster: PositionedEvent[] = [];
  let clusterEnd = -1;

  const closeCluster = () => {
    const columns = Math.max(0, ...cluster.map((item) => item.column)) + 1;

    for (const item of cluster) item.columns = columns;
    cluster = [];
  };

  for (const event of timed) {
    const startsToday = event.start.toPlainDate().equals(day);
    const endsToday = event.end.toPlainDate().equals(day);
    const top = startsToday ? gridMinutes(event.start) : 0;
    const bottom = endsToday ? gridMinutes(event.end) : (DAY_END_HOUR - DAY_START_HOUR) * 60;

    if (top >= clusterEnd) closeCluster();

    const taken = new Set(
      cluster.filter((item) => item.top + item.height > top).map((item) => item.column),
    );

    let column = 0;

    while (taken.has(column)) column += 1;

    const item = { event, top, height: Math.max(bottom - top, 20), column, columns: 1 };

    cluster.push(item);
    positioned.push(item);
    clusterEnd = Math.max(clusterEnd, top + item.height);
  }

  closeCluster();

  return positioned;
}

export function formatTime(time: Temporal.PlainDateTime) {
  return time.toPlainTime().toString({ smallestUnit: "minute" });
}

export function formatDay(date: Temporal.PlainDate, options: Intl.DateTimeFormatOptions) {
  return date.toLocaleString(LOCALE, options);
}

/** Native `Date` for date pickers; local midnight of the same calendar date. */
export function toDate(date: Temporal.PlainDate) {
  return new Date(date.year, date.month - 1, date.day);
}

export function fromDate(date: Date) {
  return Temporal.PlainDate.from({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}
