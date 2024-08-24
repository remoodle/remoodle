import { describe, test, expect, vi } from "vitest";
import { formatDate } from "./helpers";

describe("formatDate", () => {
  test("date formatting", () => {
    vi.setSystemTime(new Date("Sat, 15 Jun 2019 13:03:03"));

    expect(formatDate(new Date(), "short")).toBe("06/15/2019, 1:03 PM");

    expect(formatDate(new Date(), "medium")).toBe("Jun 15, 2019 1:03 PM");

    expect(formatDate(new Date(), "full")).toBe(
      "Saturday, June 15, 2019 1:03 PM",
    );

    expect(formatDate(new Date(), "extraShortDate")).toBe("Jun '19");

    expect(formatDate(new Date(), "superShortDate")).toBe("Jun 15");

    expect(formatDate(new Date(), "shortDate")).toBe("06/15/2019");

    expect(formatDate(new Date(), "mediumDate")).toBe("Jun 15, 2019");

    expect(formatDate(new Date(), "longDate")).toBe("June 15, 2019");

    expect(formatDate(new Date(), "fullDate")).toBe("Saturday, June 15, 2019");

    expect(formatDate(new Date(), "shortTime")).toBe("1:03 PM");

    expect(formatDate(new Date(), "mediumTime")).toBe("1:03:03 PM");
  });
});
