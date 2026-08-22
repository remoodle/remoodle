import { describe, expect, test } from "vite-plus/test";
import {
  DEFAULT_SCHEDULE_FILTERS,
  buildClassBreakdown,
  buildNextWeekScheduleMessage,
  buildWeeklyScheduleMessage,
  classifyScheduleItem,
  DEFAULT_DIGEST_WEEKDAYS,
  getAlmatyDateParts,
  getRemainingDaysOfWeek,
  getScheduleForDay,
  hasRemainingClassesThisWeek,
  isValidDigestTime,
  mergeAdjacentScheduleItems,
  normalizeDigestWeekdays,
  normalizeScheduleFilters,
} from "./schedule";

const sampleItems = [
  {
    id: "1",
    start: "Saturday 15:00",
    end: "Saturday 15:50",
    courseName: "Advanced Quality Assurance",
    location: "C1.3.362",
    isOnline: false,
    teacher: "Teacher",
    type: "practice" as const,
  },
  {
    id: "2",
    start: "Saturday 16:00",
    end: "Saturday 16:50",
    courseName: "Advanced Quality Assurance",
    location: "C1.3.362",
    isOnline: false,
    teacher: "Teacher",
    type: "practice" as const,
  },
  {
    id: "3",
    start: "Saturday 17:30",
    end: "Saturday 18:20",
    courseName: "Advanced Quality Assurance",
    location: "C1.3.362",
    isOnline: false,
    teacher: "Teacher",
    type: "practice" as const,
  },
];

const weeklyItems = [
  {
    id: "m1",
    start: "Monday 20:00",
    end: "Monday 21:50",
    courseName: "Software Development Case Study",
    location: "C1.3.370",
    isOnline: false,
    teacher: "Teacher",
    type: "lecture" as const,
  },
  {
    id: "f1",
    start: "Friday 18:00",
    end: "Friday 19:50",
    courseName: "Software Development Case Study",
    location: "C1.3.321",
    isOnline: false,
    teacher: "Teacher",
    type: "practice" as const,
  },
  {
    id: "s1",
    start: "Saturday 15:00",
    end: "Saturday 16:50",
    courseName: "Advanced Quality Assurance",
    location: "C1.3.362",
    isOnline: false,
    teacher: "Teacher",
    type: "practice" as const,
  },
];

describe("schedule merging", () => {
  test("merges back-to-back pairs with the same details", () => {
    expect(mergeAdjacentScheduleItems(sampleItems)).toStrictEqual([
      {
        ...sampleItems[0],
        end: "Saturday 16:50",
      },
      sampleItems[2],
    ]);
  });

  test("normalizes filters with merge enabled by default", () => {
    expect(DEFAULT_SCHEDULE_FILTERS.combineAdjacentPairs).toBe(true);
    expect(normalizeScheduleFilters(null).combineAdjacentPairs).toBe(true);
    expect(normalizeScheduleFilters({ combineAdjacentPairs: false }).combineAdjacentPairs).toBe(
      false,
    );
  });

  test("merged items still appear in the same day bucket", () => {
    const merged = mergeAdjacentScheduleItems(sampleItems);
    expect(getScheduleForDay(merged, "Saturday")).toHaveLength(2);
  });
});

describe("weekly schedule views", () => {
  test("only keeps days after today for this week", () => {
    expect(getRemainingDaysOfWeek(new Date("2026-04-11T10:00:00+05:00"))).toStrictEqual(["Sunday"]);
    expect(hasRemainingClassesThisWeek(weeklyItems, new Date("2026-04-11T10:00:00+05:00"))).toBe(
      false,
    );
  });

  test("this week message does not include earlier days", () => {
    const message = buildWeeklyScheduleMessage(
      weeklyItems,
      new Date("2026-04-11T10:00:00+05:00"),
      "CSE-2507M",
    );

    expect(message).toContain("<b>This week</b>");
    expect(message).toContain("No more classes this week.");
    expect(message).not.toContain("<b>Today</b>");
    expect(message).not.toContain("<b>Monday</b>");
    expect(message).not.toContain("<b>Friday</b>");
  });

  test("next week message shows the full recurring week", () => {
    const message = buildNextWeekScheduleMessage(
      weeklyItems,
      new Date("2026-04-11T10:00:00+05:00"),
      "CSE-2507M",
    );

    expect(message).toContain("<b>Next week</b>");
    expect(message).toContain("<b>Monday</b>");
    expect(message).toContain("<b>Friday</b>");
    expect(message).toContain("<b>Saturday</b>");
  });
});

describe("classifyScheduleItem", () => {
  test("offline lecture", () => {
    expect(classifyScheduleItem({ type: "lecture", isOnline: false })).toBe("lecture");
  });

  test("online lecture", () => {
    expect(classifyScheduleItem({ type: "lecture", isOnline: true })).toBe("online lecture");
  });

  test("offline practice", () => {
    expect(classifyScheduleItem({ type: "practice", isOnline: false })).toBe("practice");
  });

  test("online practice", () => {
    expect(classifyScheduleItem({ type: "practice", isOnline: true })).toBe("online practice");
  });

  test("null type offline", () => {
    expect(classifyScheduleItem({ type: null, isOnline: false })).toBe("class");
  });

  test("null type online", () => {
    expect(classifyScheduleItem({ type: null, isOnline: true })).toBe("online class");
  });
});

describe("buildClassBreakdown", () => {
  test("empty list", () => {
    expect(buildClassBreakdown([])).toBe("");
  });

  test("single lecture", () => {
    expect(buildClassBreakdown([{ type: "lecture", isOnline: false }])).toBe("1 lecture");
  });

  test("plural lectures", () => {
    expect(
      buildClassBreakdown([
        { type: "lecture", isOnline: false },
        { type: "lecture", isOnline: false },
      ]),
    ).toBe("2 lectures");
  });

  test("single practice", () => {
    expect(buildClassBreakdown([{ type: "practice", isOnline: false }])).toBe("1 practice");
  });

  test("plural practices", () => {
    expect(
      buildClassBreakdown([
        { type: "practice", isOnline: false },
        { type: "practice", isOnline: false },
        { type: "practice", isOnline: false },
      ]),
    ).toBe("3 practices");
  });

  test("mixed types in order", () => {
    expect(
      buildClassBreakdown([
        { type: "practice", isOnline: false },
        { type: "practice", isOnline: false },
        { type: "lecture", isOnline: false },
        { type: "lecture", isOnline: true },
        { type: "lecture", isOnline: true },
        { type: "lecture", isOnline: true },
        { type: "practice", isOnline: true },
      ]),
    ).toBe("2 practices, 1 lecture, 3 online lectures, 1 online practice");
  });

  test("online class (null type)", () => {
    expect(buildClassBreakdown([{ type: null, isOnline: true }])).toBe("1 online class");
  });

  test("plural classes", () => {
    expect(
      buildClassBreakdown([
        { type: null, isOnline: false },
        { type: null, isOnline: false },
      ]),
    ).toBe("2 classes");
  });
});

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
