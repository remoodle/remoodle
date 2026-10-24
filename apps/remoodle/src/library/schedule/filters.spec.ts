import { describe, expect, test } from "vite-plus/test";
import {
  applyScheduleFilters,
  DEFAULT_SCHEDULE_FILTERS,
  normalizeScheduleFilters,
} from "./filters";
import { sampleItems } from "../fixtures/schedule";

describe("bot schedule filters", () => {
  test("normalizes filters with merge enabled by default", () => {
    expect(DEFAULT_SCHEDULE_FILTERS.combineAdjacentPairs).toBe(true);
    expect(normalizeScheduleFilters(null).combineAdjacentPairs).toBe(true);
    expect(normalizeScheduleFilters({ combineAdjacentPairs: false }).combineAdjacentPairs).toBe(
      false,
    );
  });

  test("applies class filters to one course", () => {
    const filters = normalizeScheduleFilters({
      courses: {
        "Advanced Quality Assurance": {
          lecture: true,
          practice: false,
          online: true,
          offline: true,
        },
      },
    });

    const otherCourse = { ...sampleItems[0]!, id: "other", courseName: "Fault tolerance" };

    expect(applyScheduleFilters([...sampleItems, otherCourse], filters, [])).toContain(otherCourse);
    expect(applyScheduleFilters(sampleItems, filters, [])).toHaveLength(0);
  });
});
