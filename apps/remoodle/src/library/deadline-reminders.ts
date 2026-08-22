import { m } from "./i18n/messages.js";
import { bold } from "./telegram-html";
import type { CalendarEvent } from "./calendar";
import { durationToMs, getTimeLeft, formatDate, humanizeDuration } from "./dates";

export type PendingReminder = {
  eventId: string;
  triggeredAt: Date;
};

export type ExistingReminder = {
  eventId: string;
  triggeredAt: Date;
};

export function trackDeadlineReminders(
  thresholds: string[],
  events: CalendarEvent[],
  existing: ExistingReminder[],
): PendingReminder[] {
  const pending: PendingReminder[] = [];
  const nowMs = Date.now();
  const thresholdsMs = thresholds.map(durationToMs).sort((a, b) => a - b);

  for (const event of events) {
    const dueMs = event.timestampMs;
    const remainingMs = dueMs - nowMs;

    if (!Number.isFinite(dueMs) || remainingMs <= 0) {
      continue;
    }

    const eventReminders = existing.filter((r) => r.eventId === event.uid);

    for (const thresholdMs of thresholdsMs) {
      if (thresholdMs >= remainingMs) {
        const thresholdDateMs = dueMs - thresholdMs;
        const alreadySent = eventReminders.some((r) => r.triggeredAt.getTime() >= thresholdDateMs);

        if (!alreadySent) {
          pending.push({ eventId: event.uid, triggeredAt: new Date() });
        }

        break;
      }
    }
  }

  return pending;
}

export type DeadlineGroup = {
  reminders: {
    summary: string;
    timestampMs: number;
    remaining: string;
  }[];
};

export function getDeadlineName(summary: string): string {
  return summary.replace(/ is due( to be graded)?$/i, "").trim();
}

function getCourseLabel(event: Pick<CalendarEvent, "courseName">): string {
  return event.courseName?.trim() || m.unknown_course();
}

function getDeadlineIcon(timestampMs: number, fireThresholdHours = 3): string {
  const hoursLeft = (timestampMs - Date.now()) / (60 * 60 * 1000);
  return hoursLeft <= fireThresholdHours ? "🔥" : "📅";
}

export function buildReminderMessage(
  events: CalendarEvent[],
  reminders: PendingReminder[],
): string {
  const eventMap = new Map(events.map((e) => [e.uid, e]));
  type ReminderItem = {
    uid: string;
    summary: string;
    timestampMs: number;
  };

  const remindersByCourse = new Map<string, ReminderItem[]>();

  for (const reminder of reminders) {
    const event = eventMap.get(reminder.eventId);
    if (!event) {
      continue;
    }

    const courseLabel = getCourseLabel(event);
    const items = remindersByCourse.get(courseLabel) ?? [];
    items.push({
      uid: event.uid,
      summary: event.summary,
      timestampMs: event.timestampMs,
    });
    remindersByCourse.set(courseLabel, items);
  }

  const parts: string[] = [m.reminder_header(), ""];

  for (const [courseLabel, courseReminders] of Array.from(remindersByCourse.entries())) {
    parts.push(m.reminder_course_label({ course: courseLabel }));

    for (const event of courseReminders.sort(
      (a: ReminderItem, b: ReminderItem) => a.timestampMs - b.timestampMs,
    )) {
      parts.push(
        m.reminder_deadline_item({
          name: getDeadlineName(event.summary),
          timeLeft: bold(getTimeLeft(event.timestampMs)),
          date: formatDate(event.timestampMs),
        }),
      );
    }

    parts.push("");
  }

  return parts.join("\n").trim();
}

export function buildDeadlinesMessage(events: CalendarEvent[], daysLimit = 14): string {
  const nowMs = Date.now();
  const limitMs = nowMs + daysLimit * 24 * 60 * 60 * 1000;

  const upcoming = events
    .filter((e) => e.timestampMs > nowMs && e.timestampMs <= limitMs)
    .sort((a, b) => a.timestampMs - b.timestampMs);

  if (upcoming.length === 0) {
    return m.no_upcoming_deadlines({ days: daysLimit });
  }

  const parts: string[] = [m.deadlines_upcoming_header(), ""];

  for (const event of upcoming) {
    parts.push(
      m.deadline_item({
        icon: getDeadlineIcon(event.timestampMs),
        name: bold(getDeadlineName(event.summary)),
        course: getCourseLabel(event),
        date: formatDate(event.timestampMs),
        timeLeft: bold(getTimeLeft(event.timestampMs)),
      }),
      "",
    );
  }

  return parts.join("\n").trim();
}

export const AVAILABLE_THRESHOLDS = [
  "PT30M",
  "PT1H",
  "PT3H",
  "PT6H",
  "PT12H",
  "P1D",
  "P2D",
  "P1W",
] as const;

export function buildThresholdsMessage(thresholds: string[]): string {
  const parts: string[] = [bold(m.thresholds_header()), ""];

  if (thresholds.length === 0) {
    parts.push(m.no_thresholds_configured(), "");
  } else {
    parts.push(m.thresholds_active_header());
    [...thresholds]
      .sort((a, b) => durationToMs(a) - durationToMs(b))
      .forEach((t) => {
        parts.push(m.threshold_item({ duration: humanizeDuration(t) }));
      });
    parts.push("");
  }

  parts.push(m.thresholds_toggle_prompt());
  return parts.join("\n");
}
