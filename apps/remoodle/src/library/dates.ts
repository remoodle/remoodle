import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const getTimeLeft = (timestampMs: number): string => {
  const now = dayjs();
  const deadline = dayjs(timestampMs);
  const d = dayjs.duration(deadline.diff(now));

  const months = d.months();
  const days = d.days();
  const hours = String(d.hours()).padStart(2, "0");
  const minutes = String(d.minutes()).padStart(2, "0");
  const seconds = String(d.seconds()).padStart(2, "0");

  const parts: string[] = [];
  if (months > 0) {
    parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  }
  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }
  parts.push(`${hours}:${minutes}:${seconds}`);

  return parts.join(", ");
};

export const formatDate = (timestampMs: number): string => {
  return new Date(timestampMs).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const durationToMs = (iso: string): number => {
  return dayjs.duration(iso).asMilliseconds();
};

export const humanizeDuration = (iso: string): string => {
  return dayjs.duration(iso).humanize();
};
