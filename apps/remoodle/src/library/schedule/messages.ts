import { m } from "../i18n/messages.js";
import { bold } from "../telegram-html";
import type { ScheduleItem } from "./items";
import {
  WEEK_DAY_ORDER,
  extractTime,
  getDayName,
  getRemainingDaysOfWeek,
  getScheduleForDay,
} from "./week";

// Bot messages expect items from `toWeeklySchedule`, keyed by weekday name.

type ClassKind =
  | "lecture"
  | "online lecture"
  | "practice"
  | "online practice"
  | "class"
  | "online class";

const CLASS_KIND_MESSAGE: Record<ClassKind, (count: number) => string> = {
  lecture: (n) => m.class_kind_lecture({ count: n }),
  "online lecture": (n) => m.class_kind_online_lecture({ count: n }),
  practice: (n) => m.class_kind_practice({ count: n }),
  "online practice": (n) => m.class_kind_online_practice({ count: n }),
  class: (n) => m.class_kind_class({ count: n }),
  "online class": (n) => m.class_kind_online_class({ count: n }),
};

export function classifyScheduleItem(item: Pick<ScheduleItem, "type" | "isOnline">): ClassKind {
  if (item.type === "lecture") {
    return item.isOnline ? "online lecture" : "lecture";
  }

  if (item.type === "practice") {
    return item.isOnline ? "online practice" : "practice";
  }

  return item.isOnline ? "online class" : "class";
}

export function buildClassBreakdown(items: Pick<ScheduleItem, "type" | "isOnline">[]): string {
  const counts = new Map<ClassKind, number>();

  for (const item of items) {
    const kind = classifyScheduleItem(item);
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([kind, n]) => CLASS_KIND_MESSAGE[kind](n))
    .join(", ");
}

function formatScheduleItem(item: ScheduleItem): string {
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

function formatDays(items: ScheduleItem[], dayNames: string[]): string[] {
  const sections: string[] = [];

  for (const dayName of dayNames) {
    const dayItems = getScheduleForDay(items, dayName);

    if (dayItems.length === 0) {
      continue;
    }

    sections.push([bold(dayName), ...dayItems.map(formatScheduleItem)].join("\n"));
  }

  return sections;
}

export function buildTodayScheduleMessage(items: ScheduleItem[], date: Date): string {
  const dayItems = getScheduleForDay(items, getDayName(date));

  const dateStr = date.toLocaleDateString("en-GB", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Almaty",
  });

  const parts: string[] = [
    bold(m.schedule_header()),
    "",
    bold(m.schedule_today_label({ date: dateStr })),
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

export function buildWeeklyScheduleMessage(items: ScheduleItem[], date: Date): string {
  const sections = formatDays(items, getRemainingDaysOfWeek(date));
  const header = `${bold(m.schedule_header())}\n\n${bold(m.schedule_this_week())}`;

  if (sections.length === 0) {
    return `${header}\n${m.no_classes_this_week()}`;
  }

  return `${header}\n${sections.join("\n\n")}`;
}

export function buildNextWeekScheduleMessage(items: ScheduleItem[]): string {
  const sections = formatDays(items, WEEK_DAY_ORDER);
  const header = `${bold(m.schedule_header())}\n\n${bold(m.schedule_next_week())}`;

  if (sections.length === 0) {
    return `${header}\n${m.no_classes_next_week()}`;
  }

  return `${header}\n${sections.join("\n\n")}`;
}
