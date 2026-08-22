export type MergeableScheduleItem = {
  id: string | number;
  start: string;
  end: string;
  courseName: string;
  location: string;
  isOnline: boolean;
  teacher: string;
  type: string | null;
};

export type MergeableCalendarEvent = {
  id: string | number;
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  calendarId?: string;
};

const SLOT_BREAK_THRESHOLD_MINUTES = 15;
const CALENDAR_TIME_ZONE = "Asia/Almaty";
const CALENDAR_TIME_ZONE_OFFSET_MINUTES = 5 * 60;
const WEEKDAY_ORDER: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};
const RRULE_DAY: Record<string, string> = {
  Monday: "MO",
  Tuesday: "TU",
  Wednesday: "WE",
  Thursday: "TH",
  Friday: "FR",
  Saturday: "SA",
  Sunday: "SU",
};

export type IcalScheduleItem = MergeableScheduleItem;

export type IcalCalendarEvent = {
  id: string | number;
  title: string;
  description: string;
  start: string;
  end?: string;
  location: string;
};

function parseScheduleTime(timeStr: string): {
  weekday: string;
  hours: number;
  minutes: number;
} {
  const parts = timeStr.split(" ");
  if (parts.length === 2) {
    const weekday = parts[0]!;
    const [hours, minutes] = parts[1]!.split(":").map(Number);
    return { weekday, hours: hours!, minutes: minutes! };
  }

  const [hours, minutes] = timeStr.split(":").map(Number);
  return { weekday: "Monday", hours: hours!, minutes: minutes! };
}

function toMinutes(time: { hours: number; minutes: number }) {
  return time.hours * 60 + time.minutes;
}

function parseDateTime(value?: string): Date | null {
  if (!value) return null;

  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function minutesBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatUtcDate(date: Date): string {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    "00Z"
  );
}

function formatUtcDateFromParts(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): string {
  const utcDate = new Date(
    Date.UTC(year, month - 1, day, hours, minutes - CALENDAR_TIME_ZONE_OFFSET_MINUTES, 0, 0),
  );
  return formatUtcDate(utcDate);
}

function formatLocalDateTime(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
): string {
  return `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
}

function formatDateAsLocalDateTime(date: Date): string {
  return formatLocalDateTime(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  );
}

function formatDateAsUtcDate(date: Date): string {
  return formatUtcDate(date);
}

function formatEndOfDayUtcDate(date: Date): string {
  return formatUtcDateFromParts(date.getFullYear(), date.getMonth() + 1, date.getDate(), 23, 59);
}

function getZonedDateParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: parts.weekday ?? "Monday",
  };
}

function addDays(year: number, month: number, day: number, daysToAdd: number) {
  const result = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  result.setUTCDate(result.getUTCDate() + daysToAdd);

  return {
    year: result.getUTCFullYear(),
    month: result.getUTCMonth() + 1,
    day: result.getUTCDate(),
  };
}

function getNextWeekdayInTimeZone(targetDay: number, fromDate: Date) {
  const zonedNow = getZonedDateParts(fromDate, CALENDAR_TIME_ZONE);
  const currentDay = WEEKDAY_ORDER[zonedNow.weekday] ?? 1;
  const diff = (targetDay - currentDay + 7) % 7;
  return addDays(zonedNow.year, zonedNow.month, zonedNow.day, diff);
}

function createCalendarHeader(prodId: string, name: string) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    `X-WR-TIMEZONE:${CALENDAR_TIME_ZONE}`,
    "BEGIN:VTIMEZONE",
    `TZID:${CALENDAR_TIME_ZONE}`,
    `X-LIC-LOCATION:${CALENDAR_TIME_ZONE}`,
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0500",
    "TZOFFSETTO:+0500",
    "TZNAME:+05",
    "DTSTART:19700101T000000",
    "END:STANDARD",
    "END:VTIMEZONE",
  ];
}

function createUtcCalendarHeader(prodId: string, name: string) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    `X-WR-TIMEZONE:${CALENDAR_TIME_ZONE}`,
  ];
}

function createCalendarEventLines(input: {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  dtstart: string;
  dtend: string;
  dtstamp?: string;
  rrule?: string;
}) {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${escapeText(input.uid)}`,
    `SUMMARY:${escapeText(input.summary)}`,
    `DTSTART;TZID=${CALENDAR_TIME_ZONE}:${input.dtstart}`,
    `DTEND;TZID=${CALENDAR_TIME_ZONE}:${input.dtend}`,
  ];

  if (input.description) {
    lines.push(`DESCRIPTION:${escapeText(input.description)}`);
  }

  if (input.location) {
    lines.push(`LOCATION:${escapeText(input.location)}`);
  }

  if (input.rrule) {
    lines.push(`RRULE:${input.rrule}`);
  }

  if (input.dtstamp) {
    lines.push(`DTSTAMP:${input.dtstamp}`);
  }

  lines.push("END:VEVENT");
  return lines;
}

function createUtcCalendarEventLines(input: {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  dtstart: string;
  dtend: string;
  dtstamp?: string;
  rrule?: string;
}) {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${escapeText(input.uid)}`,
    `SUMMARY:${escapeText(input.summary)}`,
    `DTSTART:${input.dtstart}`,
    `DTEND:${input.dtend}`,
  ];

  if (input.description) {
    lines.push(`DESCRIPTION:${escapeText(input.description)}`);
  }

  if (input.location) {
    lines.push(`LOCATION:${escapeText(input.location)}`);
  }

  if (input.rrule) {
    lines.push(`RRULE:${input.rrule}`);
  }

  if (input.dtstamp) {
    lines.push(`DTSTAMP:${input.dtstamp}`);
  }

  lines.push("END:VEVENT");
  return lines;
}

function parseCalendarEventDateTime(value: string): Date {
  const [datePart, timePart] = value.split(" ");

  if (!datePart || !timePart) {
    return new Date(value);
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year!, (month ?? 1) - 1, day!, hour ?? 0, minute ?? 0, 0, 0);
}

function canMergeScheduleItems(current: MergeableScheduleItem, next: MergeableScheduleItem) {
  const currentStart = parseScheduleTime(current.start);
  const currentEnd = parseScheduleTime(current.end);
  const nextStart = parseScheduleTime(next.start);

  if (currentStart.weekday !== nextStart.weekday) return false;
  if (current.courseName !== next.courseName) return false;
  if (current.teacher !== next.teacher) return false;
  if (current.type !== next.type) return false;
  if (current.location !== next.location) return false;
  if (current.isOnline !== next.isOnline) return false;

  const gap = toMinutes(nextStart) - toMinutes(currentEnd);
  return gap >= 0 && gap <= SLOT_BREAK_THRESHOLD_MINUTES;
}

export function mergeAdjacentScheduleItems<T extends MergeableScheduleItem>(items: T[]) {
  if (items.length < 2) return items;

  const sortedItems = [...items].sort((a, b) => {
    const aStart = parseScheduleTime(a.start);
    const bStart = parseScheduleTime(b.start);
    const weekdayDiff =
      (WEEKDAY_ORDER[aStart.weekday] ?? 99) - (WEEKDAY_ORDER[bStart.weekday] ?? 99);

    if (weekdayDiff !== 0) return weekdayDiff;
    return toMinutes(aStart) - toMinutes(bStart);
  });

  const merged: T[] = [];

  for (const item of sortedItems) {
    const previous = merged[merged.length - 1];

    if (!previous || !canMergeScheduleItems(previous, item)) {
      merged.push({ ...item });
      continue;
    }

    previous.end = item.end;
  }

  return merged;
}

function canMergeCalendarEvents(current: MergeableCalendarEvent, next: MergeableCalendarEvent) {
  if (!current.start || !current.end || !next.start || !next.end) return false;
  if (current.title !== next.title) return false;
  if (current.description !== next.description) return false;
  if (current.calendarId !== next.calendarId) return false;

  const currentStart = parseDateTime(current.start);
  const currentEnd = parseDateTime(current.end);
  const nextStart = parseDateTime(next.start);

  if (!currentStart || !currentEnd || !nextStart) return false;
  if (currentStart.getDay() !== nextStart.getDay()) return false;

  const gap = minutesBetween(currentEnd, nextStart);
  return gap >= 0 && gap <= SLOT_BREAK_THRESHOLD_MINUTES;
}

export function mergeAdjacentCalendarEvents<T extends MergeableCalendarEvent>(events: T[]) {
  if (events.length < 2) return events;

  const sortedEvents = [...events].sort((a, b) => {
    const aStart = parseDateTime(a.start);
    const bStart = parseDateTime(b.start);

    if (!aStart || !bStart) return 0;
    return aStart.getTime() - bStart.getTime();
  });

  const merged: T[] = [];

  for (const event of sortedEvents) {
    const previous = merged[merged.length - 1];

    if (!previous || !canMergeCalendarEvents(previous, event)) {
      merged.push({ ...event });
      continue;
    }

    previous.end = event.end;
  }

  return merged;
}

export function generateScheduleIcal(
  items: IcalScheduleItem[],
  now: Date = new Date(),
  options?: {
    eventTimeFormat?: "local" | "utc";
    rangeStart?: Date;
    rangeEnd?: Date;
  },
) {
  const eventTimeFormat = options?.eventTimeFormat ?? "local";
  const rangeStart = options?.rangeStart ?? now;
  const rangeEnd = options?.rangeEnd;
  const lines =
    eventTimeFormat === "utc"
      ? createUtcCalendarHeader("-//ReMoodle Calendar//EN", "Schedule")
      : createCalendarHeader("-//ReMoodle Calendar//EN", "Schedule");

  for (const item of items) {
    const startParsed = parseScheduleTime(item.start);
    const endParsed = parseScheduleTime(item.end);
    const weekdayNum = WEEKDAY_ORDER[startParsed.weekday] ?? 1;
    const rruleDay = RRULE_DAY[startParsed.weekday] ?? "MO";
    const firstDay = getNextWeekdayInTimeZone(weekdayNum, rangeStart);
    const dtstart =
      eventTimeFormat === "utc"
        ? formatUtcDateFromParts(
            firstDay.year,
            firstDay.month,
            firstDay.day,
            startParsed.hours,
            startParsed.minutes,
          )
        : formatLocalDateTime(
            firstDay.year,
            firstDay.month,
            firstDay.day,
            startParsed.hours,
            startParsed.minutes,
          );
    const endDay =
      endParsed.hours < startParsed.hours ||
      (endParsed.hours === startParsed.hours && endParsed.minutes <= startParsed.minutes)
        ? addDays(firstDay.year, firstDay.month, firstDay.day, 1)
        : firstDay;
    const dtend =
      eventTimeFormat === "utc"
        ? formatUtcDateFromParts(
            endDay.year,
            endDay.month,
            endDay.day,
            endParsed.hours,
            endParsed.minutes,
          )
        : formatLocalDateTime(
            endDay.year,
            endDay.month,
            endDay.day,
            endParsed.hours,
            endParsed.minutes,
          );
    const description = [
      item.teacher ? `Teacher: ${item.teacher}` : "",
      item.type ? `Type: ${item.type}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    lines.push(
      ...(eventTimeFormat === "utc"
        ? createUtcCalendarEventLines({
            uid: `${item.id}@calendar`,
            summary: item.courseName,
            description,
            location: item.isOnline ? "Online" : item.location,
            dtstart,
            dtend,
            dtstamp: formatUtcDate(now),
            rrule: `FREQ=WEEKLY;BYDAY=${rruleDay}${rangeEnd ? `;UNTIL=${formatEndOfDayUtcDate(rangeEnd)}` : ""}`,
          })
        : createCalendarEventLines({
            uid: `${item.id}@calendar`,
            summary: item.courseName,
            description,
            location: item.isOnline ? "Online" : item.location,
            dtstart,
            dtend,
            dtstamp: formatUtcDate(now),
            rrule: `FREQ=WEEKLY;BYDAY=${rruleDay}${rangeEnd ? `;UNTIL=${formatEndOfDayUtcDate(rangeEnd)}` : ""}`,
          })),
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function generateCalendarEventsIcal(
  events: IcalCalendarEvent[],
  rangeStart: Date,
  endDate: Date,
) {
  const lines = createCalendarHeader("-//ReMoodle//Calendar Export//EN", "Schedule Export");

  for (const event of events) {
    const eventStart = parseCalendarEventDateTime(event.start);
    const parsedEnd = event.end ? parseCalendarEventDateTime(event.end) : null;
    const eventEnd =
      parsedEnd && !Number.isNaN(parsedEnd.getTime())
        ? parsedEnd
        : new Date(eventStart.getTime() + 50 * 60 * 1000);
    const durationMs = Math.max(eventEnd.getTime() - eventStart.getTime(), 60_000);
    const firstOccurrence = new Date(eventStart);

    while (firstOccurrence < rangeStart) {
      firstOccurrence.setDate(firstOccurrence.getDate() + 7);
    }

    if (firstOccurrence > endDate) {
      continue;
    }

    const firstOccurrenceEnd = new Date(firstOccurrence.getTime() + durationMs);
    const byDay =
      RRULE_DAY[
        ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
          firstOccurrence.getDay()
        ] ?? "Monday"
      ];

    lines.push(
      ...createCalendarEventLines({
        uid: `${event.id}@calendar-export`,
        summary: event.title,
        description: event.description,
        location: event.location,
        dtstart: formatDateAsLocalDateTime(firstOccurrence),
        dtend: formatDateAsLocalDateTime(firstOccurrenceEnd),
        dtstamp: formatDateAsUtcDate(new Date()),
        rrule: `FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${formatEndOfDayUtcDate(endDate)}`,
      }),
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export { CALENDAR_TIME_ZONE };
