import type { Temporal } from "temporal-polyfill";
import { eventsOn, formatDay, formatTime, weekDays } from "./calendar-dates";
import type { CalendarEvent } from "./calendar-events";
import { eventKindVariables } from "./event-kinds";

const WIDTH = 1680;

const COLUMN = 224;

const FONT = '"Hanken Grotesk Variable", system-ui, sans-serif';

export function imageDays(events: CalendarEvent[], week: Temporal.PlainDate) {
  return weekDays(week).map((date) => ({ date, events: eventsOn(events, date) }));
}

function timeText(event: CalendarEvent) {
  if (event.deadline) return `Due ${event.deadline}`;

  return event.dateRow ? "All day" : `${formatTime(event.start)} – ${formatTime(event.end)}`;
}

/**
 * Draws one week as a shareable PNG at 2x. Colours are read from the page's CSS variables, so
 * the image follows the active theme and DESIGN.md tokens without a second palette.
 */
export function drawScheduleImage(
  canvas: HTMLCanvasElement,
  events: CalendarEvent[],
  week: Temporal.PlainDate,
) {
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Image export is unavailable in this browser.");

  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  const days = imageDays(events, week);

  const wrap = (text: string, size: number, weight: number) => {
    context.font = `${weight} ${size}px ${FONT}`;
    const lines: string[] = [];
    let line = "";

    for (const word of text.trim().split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;

      if (line && context.measureText(candidate).width > COLUMN - 44) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }

    if (line) lines.push(line);

    return lines;
  };

  const layouts = days.map((day) =>
    day.events.map((event) => ({
      event,
      title: wrap(event.title, 18, 600),
      location: event.location ? wrap(event.location, 14, 400) : [],
    })),
  );

  const columnHeight = (items: (typeof layouts)[number]) =>
    items.reduce((sum, item) => sum + 78 + item.title.length * 24 + item.location.length * 20, 0);

  const height = Math.max(670, 194 + Math.max(...layouts.map(columnHeight)));

  canvas.width = WIDTH * 2;
  canvas.height = height * 2;
  context.scale(2, 2);
  context.fillStyle = token("--background");
  context.fillRect(0, 0, WIDTH, height);

  const text = (value: string, x: number, y: number, size: number, color: string, weight = 400) => {
    context.font = `${weight} ${size}px ${FONT}`;
    context.fillStyle = color;
    context.fillText(value, x, y);
  };

  const foreground = token("--foreground");
  const muted = token("--muted-foreground");
  const range = `${formatDay(week, { day: "numeric", month: "short" })} – ${formatDay(week.add({ days: 6 }), { day: "numeric", month: "short", year: "numeric" })}`;

  text(range, 56, 56, 18, muted);

  days.forEach((day, index) => {
    const x = 56 + index * COLUMN;
    let y = 180;

    context.fillStyle = token("--border");
    context.fillRect(x, 86, COLUMN, 1);

    if (index) context.fillRect(x - 8, 104, 1, height - 160);

    text(formatDay(day.date, { weekday: "short" }), x + 8, 124, 16, muted);
    text(String(day.date.day), x + 8, 157, 26, foreground, 600);

    if (!day.events.length) text("No events", x + 8, y + 24, 15, muted);

    for (const item of layouts[index]!) {
      const ink = token(eventKindVariables[item.event.kind]);
      const boxHeight = 66 + item.title.length * 24 + item.location.length * 20;

      context.fillStyle = token(`${eventKindVariables[item.event.kind]}-soft`);
      context.beginPath();
      context.roundRect(x + 2, y, COLUMN - 16, boxHeight, 6);
      context.fill();
      text(timeText(item.event), x + 14, y + 28, 14, ink);
      item.title.forEach((line, row) => text(line, x + 14, y + 56 + row * 24, 18, ink, 600));
      item.location.forEach((line, row) =>
        text(line, x + 14, y + 66 + item.title.length * 24 + row * 20, 14, ink),
      );
      y += boxHeight + 12;
    }
  });

  text("calendar.remoodle.app", 56, height - 26, 14, muted);
}
