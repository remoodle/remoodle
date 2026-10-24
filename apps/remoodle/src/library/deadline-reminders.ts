import { m } from "./i18n/messages.js";
import { bold } from "./telegram-html";
import type { DeadlineEvent } from "./moodle/deadlines";
import { durationToMs, getTimeLeft, formatDate } from "./dates";

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
  events: DeadlineEvent[],
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

function getCourseLabel(event: Pick<DeadlineEvent, "courseName">): string {
  return event.courseName?.trim() || m.unknown_course();
}

function formatDeadlineItem(event: DeadlineEvent): string {
  return m.deadline_item({
    name: bold(getDeadlineName(event.summary)),
    course: getCourseLabel(event),
    date: formatDate(event.timestampMs),
    timeLeft: bold(getTimeLeft(event.timestampMs)),
  });
}

// Reminders and the deadline list share one item format so both read the same.
function buildDeadlineList(header: string, events: DeadlineEvent[]): string {
  const items = [...events].sort((a, b) => a.timestampMs - b.timestampMs).map(formatDeadlineItem);

  return [header, ...items].join("\n\n");
}

export function buildReminderMessage(
  events: DeadlineEvent[],
  reminders: PendingReminder[],
): string {
  const remindedIds = new Set(reminders.map((reminder) => reminder.eventId));

  return buildDeadlineList(
    bold(m.reminder_header()),
    events.filter((event) => remindedIds.has(event.uid)),
  );
}

export function buildDeadlinesMessage(events: DeadlineEvent[], daysLimit = 14): string {
  const nowMs = Date.now();
  const limitMs = nowMs + daysLimit * 24 * 60 * 60 * 1000;
  const upcoming = events.filter((e) => e.timestampMs > nowMs && e.timestampMs <= limitMs);
  const header = bold(m.deadlines_upcoming_header());

  if (upcoming.length === 0) {
    return `${header}\n\n${m.no_upcoming_deadlines({ days: daysLimit })}`;
  }

  return buildDeadlineList(header, upcoming);
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
