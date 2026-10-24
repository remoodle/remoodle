import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";

dayjs.extend(duration);

function pluralize(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? "" : "s"}`;
}

// Sent messages stay in the chat, so the precision stops at minutes instead of a ticking clock.
export const getTimeLeft = (timestampMs: number): string => {
  const totalMinutes = Math.max(0, Math.floor((timestampMs - Date.now()) / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hours > 0
      ? `${pluralize(days, "day")}, ${pluralize(hours, "hour")}`
      : pluralize(days, "day");
  }

  if (hours > 0) {
    return minutes > 0 ? `${pluralize(hours, "hour")}, ${minutes} min` : pluralize(hours, "hour");
  }

  return `${minutes} min`;
};

export const formatDate = (timestampMs: number): string => {
  return new Date(timestampMs).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const durationToMs = (iso: string): number => {
  return dayjs.duration(iso).asMilliseconds();
};

const DURATION_UNITS = [
  { minutes: 10080, long: "week", short: "w" },
  { minutes: 1440, long: "day", short: "d" },
  { minutes: 60, long: "hour", short: "h" },
] as const;

// Reminder offsets are whole units like PT30M or P1D; pick the largest unit that divides evenly.
export const formatDuration = (iso: string, style: "long" | "short" = "long"): string => {
  const totalMinutes = Math.round(durationToMs(iso) / 60_000);
  const unit = DURATION_UNITS.find((u) => totalMinutes % u.minutes === 0);

  if (!unit) {
    return style === "short" ? `${totalMinutes}m` : `${totalMinutes} min`;
  }

  const count = totalMinutes / unit.minutes;

  return style === "short" ? `${count}${unit.short}` : pluralize(count, unit.long);
};
