import { describe, expect, test } from "vitest";
import { getGPA } from ".";

describe("getGPA", () => {
  test("should work", () => {
    expect(getGPA(100)).toStrictEqual("4.00");
    expect(getGPA(95)).toStrictEqual("4.00");
    expect(getGPA(90)).toStrictEqual("3.67");
    expect(getGPA(85)).toStrictEqual("3.33");
    expect(getGPA(80)).toStrictEqual("3.00");
    expect(getGPA(75)).toStrictEqual("2.67");
    expect(getGPA(70)).toStrictEqual("2.33");
  });
});
