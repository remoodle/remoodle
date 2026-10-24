import type { ScheduleItem } from "./items";

// Bot views bucket dated items into a weekday-keyed week ("Monday 10:00") with `toWeeklySchedule`.

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const WEEK_DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SLOT_BREAK_THRESHOLD_MINUTES = 15;

type ScheduleTime = {
  weekday: string;
  hours: number;
  minutes: number;
};

export function getDayName(date: Date): string {
  return DAY_NAMES[date.getDay()]!;
}

export function getRemainingDaysOfWeek(date: Date): string[] {
  const todayIndex = WEEK_DAY_ORDER.indexOf(getDayName(date));

  if (todayIndex === -1) {
    return WEEK_DAY_ORDER;
  }

  return WEEK_DAY_ORDER.slice(todayIndex + 1);
}

export function extractTime(timeStr: string): string {
  const parts = timeStr.split(" ");

  return parts.length === 2 ? parts[1]! : timeStr;
}

export function getScheduleForDay<T extends ScheduleItem>(items: T[], dayName: string): T[] {
  return items
    .filter((item) => item.start.startsWith(dayName))
    .sort((a, b) => extractTime(a.start).localeCompare(extractTime(b.start)));
}

export function getScheduleForDays<T extends ScheduleItem>(items: T[], dayNames: string[]): T[] {
  return dayNames.flatMap((dayName) => getScheduleForDay(items, dayName));
}

export function hasRemainingClassesThisWeek(items: ScheduleItem[], date: Date): boolean {
  return getScheduleForDays(items, getRemainingDaysOfWeek(date)).length > 0;
}

function parseScheduleTime(timeStr: string): ScheduleTime {
  const parts = timeStr.split(" ");

  if (parts.length === 2) {
    const weekday = parts[0]!;
    const [hours, minutes] = parts[1]!.split(":").map(Number);

    return { weekday, hours: hours!, minutes: minutes! };
  }

  const [hours, minutes] = timeStr.split(":").map(Number);

  return { weekday: "Monday", hours: hours!, minutes: minutes! };
}

function toMinutes(time: Pick<ScheduleTime, "hours" | "minutes">) {
  return time.hours * 60 + time.minutes;
}

function canMergeScheduleItems(current: ScheduleItem, next: ScheduleItem) {
  const currentStart = parseScheduleTime(current.start);
  const currentEnd = parseScheduleTime(current.end);
  const nextStart = parseScheduleTime(next.start);

  if (currentStart.weekday !== nextStart.weekday) {
    return false;
  }

  if (current.courseName !== next.courseName) {
    return false;
  }

  if (current.type !== next.type) {
    return false;
  }

  if (current.location !== next.location) {
    return false;
  }

  if (current.isOnline !== next.isOnline) {
    return false;
  }

  const gap = toMinutes(nextStart) - toMinutes(currentEnd);

  return gap >= 0 && gap <= SLOT_BREAK_THRESHOLD_MINUTES;
}

export function mergeAdjacentScheduleItems<T extends ScheduleItem>(items: T[]): T[] {
  if (items.length < 2) {
    return items;
  }

  const sortedItems = [...items].sort((a, b) => {
    const aStart = parseScheduleTime(a.start);
    const bStart = parseScheduleTime(b.start);
    const aWeekdayIndex = WEEK_DAY_ORDER.indexOf(aStart.weekday);
    const bWeekdayIndex = WEEK_DAY_ORDER.indexOf(bStart.weekday);

    const weekdayDiff =
      (aWeekdayIndex === -1 ? 99 : aWeekdayIndex) - (bWeekdayIndex === -1 ? 99 : bWeekdayIndex);

    if (weekdayDiff !== 0) {
      return weekdayDiff;
    }

    // Workers merge dated items ("2026-10-01 19:00") before bucketing them into a week, so the
    // day key is an ISO date rather than a weekday name. Keep each date contiguous, otherwise
    // the same slot from other weeks sorts in between and splits the pair.
    const dayDiff = aStart.weekday.localeCompare(bStart.weekday);

    if (dayDiff !== 0) {
      return dayDiff;
    }

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

// Bot messages are a weekly view of dated personal events, not a repeating source timetable.
export function toWeeklySchedule<T extends { start: string; end: string }>(
  items: T[],
  now: Date,
  weekOffset = 0,
): T[] {
  const local = new Date(now.getTime() + 5 * 60 * 60_000);

  const monday = new Date(
    Date.UTC(
      local.getUTCFullYear(),
      local.getUTCMonth(),
      local.getUTCDate() - ((local.getUTCDay() + 6) % 7) + weekOffset * 7,
    ),
  );

  const end = new Date(monday.getTime() + 7 * 86_400_000).toISOString().slice(0, 10);
  const start = monday.toISOString().slice(0, 10);

  return items.flatMap((item) => {
    if (item.start.slice(0, 10) < start || item.start.slice(0, 10) >= end) {
      return [];
    }

    const day = DAY_NAMES[new Date(item.start.slice(0, 10) + "T12:00:00Z").getUTCDay()];

    return [
      {
        ...item,
        start: `${day} ${item.start.slice(11)}`,
        end: `${day} ${item.end.slice(11)}`,
      },
    ];
  });
}
