import { describe, expect, test } from "vite-plus/test";
import { parseFirstWeekStart, studyYearOf } from "./schemas";

describe("parseFirstWeekStart", () => {
  test("accepts ISO and dotted Mondays", () => {
    expect(parseFirstWeekStart("2026-09-07")).toBe("2026-09-07");
    expect(parseFirstWeekStart(" 7.09.2026 ")).toBe("2026-09-07");
  });

  test("rejects other weekdays and impossible dates", () => {
    expect(parseFirstWeekStart("2026-09-08")).toBeNull();
    expect(parseFirstWeekStart("31.02.2026")).toBeNull();
    expect(parseFirstWeekStart("next monday")).toBeNull();
  });
});

describe("studyYearOf", () => {
  test("names the academic year after the year it starts in", () => {
    expect(studyYearOf("2026-08-31")).toBe(2026);
    expect(studyYearOf("2027-01-11")).toBe(2026);
    expect(studyYearOf("2027-06-07")).toBe(2026);
  });
});
