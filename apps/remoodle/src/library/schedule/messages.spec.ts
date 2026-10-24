import { describe, expect, test } from "vite-plus/test";
import {
  buildClassBreakdown,
  buildNextWeekScheduleMessage,
  buildWeeklyScheduleMessage,
  classifyScheduleItem,
} from "./messages";
import { weeklyItems } from "../fixtures/schedule";

describe("weekly schedule views", () => {
  test("this week message does not include earlier days", () => {
    const message = buildWeeklyScheduleMessage(weeklyItems, new Date("2026-04-11T10:00:00+05:00"));

    expect(message).toContain("<b>This week</b>");
    expect(message).toContain("No more classes this week.");
    expect(message).not.toContain("<b>Today</b>");
    expect(message).not.toContain("<b>Monday</b>");
    expect(message).not.toContain("<b>Friday</b>");
  });

  test("next week message shows the full recurring week", () => {
    const message = buildNextWeekScheduleMessage(weeklyItems);

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
