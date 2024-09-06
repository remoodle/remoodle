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

export const DEFAULT_NOTIFICATIONS = Object.fromEntries(
  DEFAULT_THRESHOLDS.map((value) => [value, false]),
);

const convertToMs = (value: string): number => {
  const [amount, unit] = value.split(" ");
  const numAmount = parseInt(amount, 10);

  switch (unit.toLowerCase()) {
    case "minute":
    case "minutes":
      return numAmount * 60 * 1000;
    case "hour":
    case "hours":
      return numAmount * 60 * 60 * 1000;
    case "day":
    case "days":
      return numAmount * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
};

const convertThresholds = (thresholds: string[]): number[] => {
  return thresholds.map(convertToMs).sort((a, b) => a - b);
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
      const hours = Math.floor(remainingMs / HOUR);
      const minutes = Math.floor((remainingMs % HOUR) / MINUTE);
      return [
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`,
        thresholds[i],
      ];
    }
  }

  return [null, null];
};
