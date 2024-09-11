import { getTimeLeft } from "@remoodle/utils";

export const createBlankThresholdsMap = (
  thresholds: string[],
): Record<string, boolean> => {
  return Object.fromEntries(thresholds.map((value) => [value, false]));
};

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
): [string, string] | [null, null] => {
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
