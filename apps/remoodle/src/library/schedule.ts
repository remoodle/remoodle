import { m } from "./i18n/messages.js";
import { bold } from "./telegram-html";

type CalendarScheduleItem = {
  id: string;
  start: string;
  end: string;
  courseName: string;
  location: string;
  isOnline: boolean;
  teacher: string;
  type: "lecture" | "practice" | null;
};

export type ScheduleFilters = {
  eventTypes: { lecture: boolean; practice: boolean; learn: boolean };
  eventFormats: { online: boolean; offline: boolean };
  combineAdjacentPairs?: boolean;
};

export const DEFAULT_SCHEDULE_FILTERS: ScheduleFilters = {
  eventTypes: { lecture: true, practice: true, learn: true },
  eventFormats: { online: true, offline: true },
  combineAdjacentPairs: true,
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEK_DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DIGEST_WEEKDAYS = [
  { value: 1, label: "Monday", shortLabel: "Mon" },
  { value: 2, label: "Tuesday", shortLabel: "Tue" },
  { value: 3, label: "Wednesday", shortLabel: "Wed" },
  { value: 4, label: "Thursday", shortLabel: "Thu" },
  { value: 5, label: "Friday", shortLabel: "Fri" },
  { value: 6, label: "Saturday", shortLabel: "Sat" },
  { value: 0, label: "Sunday", shortLabel: "Sun" },
] as const;

export const DEFAULT_DIGEST_WEEKDAYS = DIGEST_WEEKDAYS.map((day) => day.value);

const ALMATY_TIME_ZONE = "Asia/Almaty";

export function normalizeDigestWeekdays(weekdays?: number[] | null): number[] {
  if (!Array.isArray(weekdays)) {
    return DEFAULT_DIGEST_WEEKDAYS;
  }

  const valid = new Set<number>(DIGEST_WEEKDAYS.map((day) => day.value));
  return weekdays.filter((day, index) => valid.has(day) && weekdays.indexOf(day) === index);
}

export function isValidDigestTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function getAlmatyDateParts(date: Date): {
  dateKey: string;
  weekday: number;
  time: string;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ALMATY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const weekdayLabel = get("weekday");
  const weekday = DIGEST_WEEKDAYS.find((day) => day.shortLabel === weekdayLabel)?.value ?? 0;

  return {
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
    weekday,
    time: `${get("hour")}:${get("minute")}`,
  };
}

export function getRemainingDaysOfWeek(date: Date): string[] {
  const todayName = getDayName(date);
  const todayIndex = WEEK_DAY_ORDER.indexOf(todayName);

  if (todayIndex === -1) {
    return WEEK_DAY_ORDER;
  }

  return WEEK_DAY_ORDER.slice(todayIndex + 1);
}

export function getScheduleForDays(
  items: CalendarScheduleItem[],
  dayNames: string[],
): CalendarScheduleItem[] {
  return dayNames.flatMap((dayName) => getScheduleForDay(items, dayName));
}

export function hasRemainingClassesThisWeek(items: CalendarScheduleItem[], date: Date): boolean {
  return getScheduleForDays(items, getRemainingDaysOfWeek(date)).length > 0;
}

export function getDayName(date: Date): string {
  return DAY_NAMES[date.getDay()]!;
}

function extractTime(timeStr: string): string {
  const parts = timeStr.split(" ");
  return parts.length === 2 ? parts[1]! : timeStr;
}

import { extractRoomCode } from "./rooms";

const SLOT_BREAK_THRESHOLD_MINUTES = 15;

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

function canMergeScheduleItems(current: CalendarScheduleItem, next: CalendarScheduleItem) {
  const currentStart = parseScheduleTime(current.start);
  const currentEnd = parseScheduleTime(current.end);
  const nextStart = parseScheduleTime(next.start);

  if (currentStart.weekday !== nextStart.weekday) {
    return false;
  }
  if (current.courseName !== next.courseName) {
    return false;
  }
  if (current.teacher !== next.teacher) {
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

export function mergeAdjacentScheduleItems(items: CalendarScheduleItem[]): CalendarScheduleItem[] {
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
    return toMinutes(aStart) - toMinutes(bStart);
  });

  const merged: CalendarScheduleItem[] = [];

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

export function normalizeScheduleFilters(
  filters?: Partial<ScheduleFilters> | null,
): ScheduleFilters {
  return {
    eventTypes: {
      ...DEFAULT_SCHEDULE_FILTERS.eventTypes,
      ...filters?.eventTypes,
    },
    eventFormats: {
      ...DEFAULT_SCHEDULE_FILTERS.eventFormats,
      ...filters?.eventFormats,
    },
    combineAdjacentPairs:
      filters?.combineAdjacentPairs ?? DEFAULT_SCHEDULE_FILTERS.combineAdjacentPairs,
  };
}

function formatScheduleItem(item: CalendarScheduleItem): string {
  const start = extractTime(item.start);
  const end = extractTime(item.end);
  const type =
    item.type === "lecture"
      ? m.class_type_lecture()
      : item.type === "practice"
        ? m.class_type_practice()
        : m.class_type_class();
  const location = item.isOnline ? m.location_online() : item.location;

  return m.schedule_item({
    time: bold(`${start} – ${end}`),
    type,
    course: item.courseName,
    location,
  });
}

export function getUniqueRooms(items: CalendarScheduleItem[]): string[] {
  const seen = new Set<string>();
  const rooms: string[] = [];
  for (const item of items) {
    if (!item.isOnline) {
      const code = extractRoomCode(item.location);
      if (code && !seen.has(code)) {
        seen.add(code);
        rooms.push(code);
      }
    }
  }
  return rooms;
}

type ClassKind =
  | "lecture"
  | "online lecture"
  | "practice"
  | "online practice"
  | "class"
  | "online class";

export function classifyScheduleItem(item: {
  type: "lecture" | "practice" | null;
  isOnline: boolean;
}): ClassKind {
  if (item.type === "lecture") {
    return item.isOnline ? "online lecture" : "lecture";
  }
  if (item.type === "practice") {
    return item.isOnline ? "online practice" : "practice";
  }
  return item.isOnline ? "online class" : "class";
}

const CLASS_KIND_MESSAGE: Record<ClassKind, (count: number) => string> = {
  lecture: (n) => m.class_kind_lecture({ count: n }),
  "online lecture": (n) => m.class_kind_online_lecture({ count: n }),
  practice: (n) => m.class_kind_practice({ count: n }),
  "online practice": (n) => m.class_kind_online_practice({ count: n }),
  class: (n) => m.class_kind_class({ count: n }),
  "online class": (n) => m.class_kind_online_class({ count: n }),
};

export function buildClassBreakdown(
  items: { type: "lecture" | "practice" | null; isOnline: boolean }[],
): string {
  const counts = new Map<ClassKind, number>();
  for (const item of items) {
    const kind = classifyScheduleItem(item);
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([kind, n]) => CLASS_KIND_MESSAGE[kind](n))
    .join(", ");
}

export function applyScheduleFilters(
  items: CalendarScheduleItem[],
  filters: ScheduleFilters,
  excludedCourses: string[],
): CalendarScheduleItem[] {
  return items.filter((item) => {
    if (excludedCourses.includes(item.courseName)) {
      return false;
    }

    const isLearn = item.teacher.startsWith("https://learn");
    if (isLearn && !filters.eventTypes.learn) {
      return false;
    }
    if (!isLearn && item.type === "lecture" && !filters.eventTypes.lecture) {
      return false;
    }
    if (!isLearn && item.type === "practice" && !filters.eventTypes.practice) {
      return false;
    }

    if (item.isOnline && !filters.eventFormats.online) {
      return false;
    }
    if (!item.isOnline && !filters.eventFormats.offline) {
      return false;
    }

    return true;
  });
}

export function getScheduleForDay(
  items: CalendarScheduleItem[],
  dayName: string,
): CalendarScheduleItem[] {
  return items
    .filter((item) => item.start.startsWith(dayName))
    .sort((a, b) => extractTime(a.start).localeCompare(extractTime(b.start)));
}

export function buildScheduleMessage(
  items: CalendarScheduleItem[],
  date: Date,
  group: string,
): string {
  const dayName = getDayName(date);
  const dayItems = getScheduleForDay(items, dayName);

  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Almaty",
  });

  const parts: string[] = [`${bold(m.schedule_header({ group }))}\n${dateStr}`, ""];

  if (dayItems.length === 0) {
    parts.push(m.no_classes());
    return parts.join("\n");
  }

  for (const item of dayItems) {
    parts.push(formatScheduleItem(item), "");
  }

  return parts.join("\n").trim();
}

export function buildTodayScheduleMessage(
  items: CalendarScheduleItem[],
  date: Date,
  group: string,
): string {
  const dayName = getDayName(date);
  const dayItems = getScheduleForDay(items, dayName);

  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Almaty",
  });

  const parts: string[] = [
    bold(m.schedule_header({ group })),
    "",
    m.schedule_today_label({ date: dateStr }),
    "",
  ];

  if (dayItems.length === 0) {
    parts.push(m.no_classes_today());
    return parts.join("\n");
  }

  for (const item of dayItems) {
    parts.push(formatScheduleItem(item), "");
  }

  return parts.join("\n").trim();
}

export function buildWeeklyScheduleMessage(
  items: CalendarScheduleItem[],
  date: Date,
  group: string,
): string {
  const orderedDays = getRemainingDaysOfWeek(date);

  const sections: string[] = [];
  for (const dayName of orderedDays) {
    const dayItems = getScheduleForDay(items, dayName);
    if (dayItems.length === 0) {
      continue;
    }

    const lines = [bold(dayName)];
    for (const item of dayItems) {
      lines.push(formatScheduleItem(item));
    }

    sections.push(lines.join("\n"));
  }

  const header = `${bold(m.schedule_header({ group }))}\n\n${bold(m.schedule_this_week())}`;

  if (sections.length === 0) {
    return `${header}\n${m.no_classes_this_week()}`;
  }

  return `${header}\n${sections.join("\n\n")}`;
}

export function buildNextWeekScheduleMessage(
  items: CalendarScheduleItem[],
  _date: Date,
  group: string,
): string {
  const sections: string[] = [];
  for (const dayName of WEEK_DAY_ORDER) {
    const dayItems = getScheduleForDay(items, dayName);
    if (dayItems.length === 0) {
      continue;
    }

    const lines = [bold(dayName)];
    for (const item of dayItems) {
      lines.push(formatScheduleItem(item));
    }

    sections.push(lines.join("\n"));
  }

  const header = `${bold(m.schedule_header({ group }))}\n\n${bold(m.schedule_next_week())}`;

  if (sections.length === 0) {
    return `${header}\n${m.no_classes_next_week()}`;
  }

  return `${header}\n${sections.join("\n\n")}`;
}
