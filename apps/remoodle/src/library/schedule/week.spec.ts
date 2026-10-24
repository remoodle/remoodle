import { describe, expect, test } from "vite-plus/test";
import {
  getRemainingDaysOfWeek,
  getScheduleForDay,
  hasRemainingClassesThisWeek,
  mergeAdjacentScheduleItems,
} from "./week";
import { sampleItems, weeklyItems } from "../fixtures/schedule";

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

  test("merges adjacent pairs when only their undisplayed teachers differ", () => {
    const second = { ...sampleItems[1]!, teacher: "Replacement teacher" };

    expect(mergeAdjacentScheduleItems([sampleItems[0]!, second])).toStrictEqual([
      { ...sampleItems[0], end: second.end },
    ]);
  });

  test("merges adjacent pairs of dated items that repeat across weeks", () => {
    const dated = (date: string, hour: number) => ({
      ...sampleItems[0]!,
      id: `${date}-${hour}`,
      start: `${date} ${hour}:00`,
      end: `${date} ${hour}:50`,
    });

    const merged = mergeAdjacentScheduleItems([
      dated("2026-09-24", 19),
      dated("2026-09-24", 20),
      dated("2026-10-01", 19),
      dated("2026-10-01", 20),
    ]);

    expect(merged.map((item) => [item.start, item.end])).toStrictEqual([
      ["2026-09-24 19:00", "2026-09-24 20:50"],
      ["2026-10-01 19:00", "2026-10-01 20:50"],
    ]);
  });

  test("merged items still appear in the same day bucket", () => {
    const merged = mergeAdjacentScheduleItems(sampleItems);
    expect(getScheduleForDay(merged, "Saturday")).toHaveLength(2);
  });
});

test("only keeps days after today for this week", () => {
  expect(getRemainingDaysOfWeek(new Date("2026-04-11T10:00:00+05:00"))).toStrictEqual(["Sunday"]);
  expect(hasRemainingClassesThisWeek(weeklyItems, new Date("2026-04-11T10:00:00+05:00"))).toBe(
    false,
  );
});
