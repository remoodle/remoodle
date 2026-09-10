import type { CalendarEvent } from "@schedule-x/calendar";
import { Temporal } from "temporal-polyfill";
import { CALENDAR_TIME_ZONE } from "../../shared/ical";

function dateTime(value: CalendarEvent["start"]) {
  return value instanceof Temporal.ZonedDateTime
    ? value.withTimeZone(CALENDAR_TIME_ZONE).toPlainDateTime().toString()
    : value.toString();
}

export function scheduleImageDays(events: CalendarEvent[], week: Temporal.PlainDate) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = week.add({ days: index });
    const key = date.toString();
    return {
      date,
      events: events
        .filter((event) => {
          const start = dateTime(event.start).slice(0, 10);
          const end = dateTime(event.end).slice(0, 10);
          // Schedule-X uses inclusive end dates for date-row events.
          const endsAtMidnight =
            !(event.end instanceof Temporal.PlainDate) &&
            dateTime(event.end).slice(11, 16) === "00:00" &&
            end > start;
          return start <= key && (endsAtMidnight ? end > key : end >= key);
        })
        .sort((a, b) => dateTime(a.start).localeCompare(dateTime(b.start))),
    };
  });
}

export function drawScheduleImage(
  canvas: HTMLCanvasElement,
  events: CalendarEvent[],
  week: Temporal.PlainDate,
  dark: boolean,
) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image export is unavailable in this browser.");
  const days = scheduleImageDays(events, week);
  const width = 1680;
  const column = 224;
  const foreground = dark ? "#fafafa" : "#18181b";
  const muted = dark ? "#a1a1aa" : "#71717a";
  const line = dark ? "#303033" : "#e4e4e7";
  const font = "Arial, sans-serif";
  function wrap(text: string, size: number) {
    context!.font = `${size === 18 ? 600 : 400} ${size}px ${font}`;
    const lines: string[] = [];
    let current = "";
    for (const word of text.trim().split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && context!.measureText(candidate).width > column - 44) {
        lines.push(current);
        current = "";
      }
      // Break only words that cannot fit on a line by themselves.
      for (const character of (current ? " " : "") + word) {
        if (context!.measureText(current + character).width > column - 44) {
          lines.push(current);
          current = "";
        }
        current += character;
      }
    }
    if (current) lines.push(current.trim());
    return lines;
  }
  const layouts = days.map((day) =>
    day.events.map((event) => ({
      event,
      title: wrap(event.title || "Untitled event", 18),
      location: wrap(typeof event.location === "string" ? event.location : "", 14),
    })),
  );
  const height = Math.max(
    670,
    194 +
      Math.max(
        ...layouts.map((items) =>
          items.reduce(
            (sum, item) => sum + 78 + item.title.length * 24 + item.location.length * 20,
            0,
          ),
        ),
      ),
  );
  // Render at 2x for crisp text when shared or printed.
  canvas.width = width * 2;
  canvas.height = height * 2;
  context.scale(2, 2);
  context.fillStyle = dark ? "#18181b" : "#ffffff";
  context.fillRect(0, 0, width, height);
  function text(
    value: string,
    x: number,
    y: number,
    size: number,
    color = foreground,
    weight = 400,
  ) {
    context!.font = `${weight} ${size}px ${font}`;
    context!.fillStyle = color;
    context!.fillText(value, x, y);
  }
  const format = (date: Temporal.PlainDate) =>
    date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  text(`${format(week)} – ${format(week.add({ days: 6 }))}`, 56, 56, 18, muted);
  days.forEach((day, index) => {
    const x = 56 + index * column;
    context.fillStyle = line;
    context.fillRect(x, 86, column, 1);
    if (index) context.fillRect(x - 8, 104, 1, height - 160);
    text(day.date.toLocaleString("en-GB", { weekday: "short" }), x + 8, 124, 16, muted);
    text(String(day.date.day), x + 8, 157, 26, foreground, 600);
    let y = 180;
    if (!day.events.length) text("No events", x + 8, y + 24, 15, muted);
    for (const item of layouts[index]!) {
      const h = 66 + item.title.length * 24 + item.location.length * 20;
      const color = item.event.calendarId === "offline" ? "#ef9a9a" : "#93b8ed";
      context.fillStyle = dark ? "#242427" : "#f4f4f5";
      context.beginPath();
      context.roundRect(x + 2, y, column - 16, h, 8);
      context.fill();
      context.fillStyle = color;
      context.fillRect(x + 2, y + 12, 3, h - 24);
      const start = dateTime(item.event.start);
      const end = dateTime(item.event.end);
      const time =
        item.event.start instanceof Temporal.PlainDate
          ? "All day"
          : `${start.slice(11, 16)} – ${end.slice(11, 16)}`;
      text(time, x + 16, y + 28, 14, muted);
      item.title.forEach((value, row) =>
        text(value, x + 16, y + 56 + row * 24, 18, foreground, 600),
      );
      item.location.forEach((value, row) =>
        text(value, x + 16, y + 66 + item.title.length * 24 + row * 20, 14, muted),
      );
      y += h + 12;
    }
  });
  text("calendar.remoodle.app", 56, height - 26, 14, muted);
}
