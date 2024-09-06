import { getTimeLeft } from "@remoodle/utils";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const DEFAULT_THRESHOLDS = [
  "30 minutes",
  "1 hour",
  "3 hours",
  "6 hours",
  "12 hours",
  "1 day",
  "2 days",
  "3 days",
  "4 days",
  "5 days",
  "6 days",
  "7 days",
  "8 days",
  "9 days",
];

export const DEFAULT_THRESHOLDS_NOTIFICATIONS = Object.fromEntries(
  DEFAULT_THRESHOLDS.map((value) => [value, false]),
);

const convertThresholdToMs = (value: string): number => {
  const [amount, unit] = value.split(" ");
  const num = parseInt(amount, 10);

  switch (unit.toLowerCase()) {
    case "minute":
    case "minutes":
      return num * 60 * 1000;
    case "hour":
    case "hours":
      return num * 60 * 60 * 1000;
    case "day":
    case "days":
      return num * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
};

const convertThresholds = (thresholds: string[]): number[] => {
  return thresholds.map(convertThresholdToMs).sort((a, b) => a - b);
};

export const calculateRemainingTime = (
  dueDate: number,
  thresholds: string[],
): [string | null, string | null] => {
  const thresholdsMs = convertThresholds(thresholds);

  const now = Date.now();
  const remainingMs = dueDate - now;

  if (remainingMs <= 0) {
    return [null, null];
  }

  for (let i = 0; i < thresholdsMs.length; i++) {
    if (remainingMs <= thresholdsMs[i]) {
      return [getTimeLeft(dueDate), thresholds[i]];
    }
  }

  return [null, null];
};
