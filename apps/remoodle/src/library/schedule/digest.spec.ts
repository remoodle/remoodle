import { describe, expect, test } from "vite-plus/test";
import {
  DEFAULT_DIGEST_WEEKDAYS,
  getAlmatyDateParts,
  isValidDigestTime,
  normalizeDigestWeekdays,
} from "./digest";

describe("digest settings", () => {
  test("normalizes weekday selections", () => {
    expect(normalizeDigestWeekdays(null)).toStrictEqual(DEFAULT_DIGEST_WEEKDAYS);
    expect(normalizeDigestWeekdays([1, 1, 5, 9, 0])).toStrictEqual([1, 5, 0]);
    expect(normalizeDigestWeekdays([])).toStrictEqual([]);
  });

  test("validates HH:MM time input", () => {
    expect(isValidDigestTime("08:00")).toBe(true);
    expect(isValidDigestTime("17:30")).toBe(true);
    expect(isValidDigestTime("8:00")).toBe(false);
    expect(isValidDigestTime("24:00")).toBe(false);
    expect(isValidDigestTime("12:60")).toBe(false);
  });

  test("reads Almaty date, weekday, and time", () => {
    expect(getAlmatyDateParts(new Date("2026-05-10T03:05:00Z"))).toStrictEqual({
      dateKey: "2026-05-10",
      weekday: 0,
      time: "08:05",
    });
  });
});
