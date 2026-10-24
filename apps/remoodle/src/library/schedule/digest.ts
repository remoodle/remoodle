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

type AlmatyDateParts = {
  dateKey: string;
  weekday: number;
  time: string;
};

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

export function getAlmatyDateParts(date: Date): AlmatyDateParts {
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
