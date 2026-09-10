import type { ScheduleItem } from "./schedule";
export const CALENDAR_TIME_ZONE = "Asia/Almaty";

export type IcalCalendarEvent = {
  id: string | number;
  title: string;
  description: string;
  start: string;
  end?: string;
  location: string;
  allDay?: boolean;
};

export function mergeAdjacentCalendarEvents<
  T extends {
    start?: string;
    end?: string;
    title?: string;
    description?: string;
    location?: string;
    calendarId?: string;
  },
>(events: T[]): T[] {
  const result: T[] = [];
  for (const event of [...events].sort((a, b) => (a.start ?? "").localeCompare(b.start ?? ""))) {
    const previous = result[result.length - 1];
    const gap =
      previous?.end && event.start
        ? (Date.parse(event.start.replace(" ", "T") + "+05:00") -
            Date.parse(previous.end.replace(" ", "T") + "+05:00")) /
          60_000
        : -1;
    if (
      previous &&
      previous.start?.slice(0, 10) === event.start?.slice(0, 10) &&
      previous.title === event.title &&
      previous.description === event.description &&
      previous.location === event.location &&
      previous.calendarId === event.calendarId &&
      gap >= 0 &&
      gap <= 15
    )
      previous.end = event.end;
    else result.push({ ...event });
  }
  return result;
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

// RFC 5545 folds by UTF-8 octets, not JS string length.
function fold(line: string) {
  const lines: string[] = [];
  let part = "";
  let size = 0;
  for (const char of line) {
    const length = new TextEncoder().encode(char).length;
    if (size + length > 75) {
      lines.push(part);
      part = " ";
      size = 1;
    }
    part += char;
    size += length;
  }
  lines.push(part);
  return lines.join("\r\n");
}

export function scheduleToCalendarEvents(items: ScheduleItem[]): IcalCalendarEvent[] {
  return items.map((item) => ({
    id: item.id,
    title: item.courseName,
    start: item.start,
    end: item.end,
    location: item.location,
    description: [item.teacher, item.lessonType, item.location].filter(Boolean).join(" | "),
  }));
}

export function generateCalendarEventsIcal(
  events: IcalCalendarEvent[],
  rangeStart?: Date | string,
  rangeEnd?: Date | string,
) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ReMoodle//My DU Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:My DU schedule",
    "X-WR-TIMEZONE:Asia/Almaty",
  ];
  const timestamp = (value: string) =>
    new Date(value.replace(" ", "T") + "+05:00")
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
  for (const event of events) {
    const date = event.start.slice(0, 10);
    const startDate =
      typeof rangeStart === "string" ? rangeStart : rangeStart?.toISOString().slice(0, 10);
    const endDate = typeof rangeEnd === "string" ? rangeEnd : rangeEnd?.toISOString().slice(0, 10);
    if (startDate && date < startDate) continue;
    if (endDate && date > endDate) continue;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeText(String(event.id))}@calendar.remoodle.app`,
      `DTSTAMP:${stamp}`,
      event.allDay
        ? `DTSTART;VALUE=DATE:${event.start.replace(/-/g, "")}`
        : `DTSTART:${timestamp(event.start)}`,
      event.allDay
        ? `DTEND;VALUE=DATE:${(event.end ?? event.start).replace(/-/g, "")}`
        : `DTEND:${timestamp(event.end ?? event.start)}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `LOCATION:${escapeText(event.location)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
