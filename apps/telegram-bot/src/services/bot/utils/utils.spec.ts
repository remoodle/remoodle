import { describe, expect, test } from "vitest";
import { calculateGrades, getGPA } from ".";

describe("calculateGrades", () => {
  test("should return no scholarship", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 50,
        itemtype: "manual",
      },
      {
        name: "Register Endterm",
        graderaw: 50,
        itemtype: "manual",
      },
      {
        name: "Register Final",
        graderaw: 50,
        itemtype: "manual",
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "No scholarship 😭
      TOTAL: 50.00
      GPA: 1.00
      "
    `);
  });

  test("should return scholarship", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 70,
        itemtype: "manual",
      },
      {
        name: "Register Endterm",
        graderaw: 70,
        itemtype: "manual",
      },
      {
        name: "Register Final",
        graderaw: 70,
        itemtype: "manual",
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "Scholarship 🎉
      TOTAL: 70.00
      GPA: 2.33
      "
    `);
  });

  test("should return high scholarship", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 90,
        itemtype: "manual",
      },
      {
        name: "Register Endterm",
        graderaw: 95,
        itemtype: "manual",
      },
      {
        name: "Register Final",
        graderaw: 100,
        itemtype: "manual",
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "High scholarship 🎉🎉
      TOTAL: 95.50
      GPA: 4.00
      "
    `);
  });

  test("should return retake", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 40,
        itemtype: "manual",
      },
      {
        name: "Register Endterm",
        graderaw: 40,
        itemtype: "manual",
      },
      {
        name: "Register Final",
        graderaw: 40,
        itemtype: "manual",
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "Retake 💀
      TOTAL: 40.00
      GPA: 0.00
      "
    `);
  });
});

describe("calculateGradesFinal", () => {
  test("should return scholarship > 50", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 100,
        itemtype: "manual",
      },
      {
        name: "Register Endterm",
        graderaw: 100,
        itemtype: "manual",
      },
      {
        name: "Register Final",
        graderaw: null,
        itemtype: "manual",
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "👹 Avoid retake: <b>final > 50.0</b>
      💚 Save scholarship: <b>final > 50.0</b>
      😈 High scholarship: <b>final > 75.0</b>
      "
    `);
  });

  test("should return high scholarship impossible", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 60,
        itemtype: "manual",
      },
      {
        name: "Register Endterm",
        graderaw: 60,
        itemtype: "manual",
      },
      {
        name: "Register Final",
        graderaw: null,
        itemtype: "manual",
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "👹 Avoid retake: <b>final > 50.0</b>
      💚 Save scholarship: <b>final > 85.0</b>
      😈 High scholarship: <b>unreachable(135.0)</b>
      "
    `);
  });

  test("should return empty block", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 60,
        itemtype: "manual",
      },
      {
        name: "Register Endterm",
        graderaw: null,
        itemtype: "manual",
      },
      {
        name: "Register Final",
        graderaw: 60,
        itemtype: "manual",
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      ""
    `);
  });

  test("should return empty block (all null)", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: null,
        itemtype: "manual",
      },
      {
        name: "Register Endterm",
        graderaw: null,
        itemtype: "manual",
      },
      {
        name: "Register Final",
        graderaw: null,
        itemtype: "manual",
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      ""
    `);
  });

  test("should return empty block (all undefined)", () => {
    const grades = [
      {
        name: "Register Midterm",
        itemtype: "manual",
      },
      {
        name: "Register Endterm",
        itemtype: "manual",
      },
      {
        name: "Register Final",
        itemtype: "manual",
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      ""
    `);
  });
});

describe("calculateGPA", () => {
  test("should return gpa", () => {
    expect(getGPA(100)).toMatchInlineSnapshot(`"4.00"`);
    expect(getGPA(95)).toMatchInlineSnapshot(`"4.00"`);
    expect(getGPA(90)).toMatchInlineSnapshot(`"3.67"`);
    expect(getGPA(85)).toMatchInlineSnapshot(`"3.33"`);
    expect(getGPA(80)).toMatchInlineSnapshot(`"3.00"`);
    expect(getGPA(75)).toMatchInlineSnapshot(`"2.67"`);
    expect(getGPA(70)).toMatchInlineSnapshot(`"2.33"`);
    expect(getGPA(65)).toMatchInlineSnapshot(`"2.00"`);
    expect(getGPA(60)).toMatchInlineSnapshot(`"1.67"`);
    expect(getGPA(55)).toMatchInlineSnapshot(`"1.33"`);
    expect(getGPA(50)).toMatchInlineSnapshot(`"1.00"`);
  });
});
