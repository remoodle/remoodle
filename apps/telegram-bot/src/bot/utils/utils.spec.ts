import { describe, expect, test } from "vitest";
import { calculateGrades, getGPA } from ".";
import { CourseGradeItem } from "@remoodle/types";

describe("calculateGrades", () => {
  test("should return no scholarship", () => {
    const grades: CourseGradeItem[] = [
      {
        name: "Register Midterm",
        graderaw: 50,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Endterm",
        graderaw: 50,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Final",
        graderaw: 50,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "No scholarship 😭
      <b>TOTAL  →  50.00</b>
      <b>GPA  →  1.00</b>

      "
    `);
  });

  test("should return scholarship", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 70,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Endterm",
        graderaw: 70,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Final",
        graderaw: 70,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "Scholarship 🎉
      <b>TOTAL  →  70.00</b>
      <b>GPA  →  2.33</b>

      "
    `);
  });

  test("should return high scholarship", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 90,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Endterm",
        graderaw: 95,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Final",
        graderaw: 100,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "High scholarship 🎉🎉
      <b>TOTAL  →  95.50</b>
      <b>GPA  →  4.00</b>

      "
    `);
  });

  test("should return retake", () => {
    const grades = [
      {
        name: "Register Midterm",
        graderaw: 40,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Endterm",
        graderaw: 40,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Final",
        graderaw: 40,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "Retake 💀
      <b>TOTAL  →  40.00</b>
      <b>GPA  →  0.00</b>

      "
    `);
  });
});

describe("calculateGradesFinal", () => {
  test("should return scholarship > 50", () => {
    const grades: CourseGradeItem[] = [
      {
        name: "Register Midterm",
        graderaw: 100,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Endterm",
        graderaw: 100,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Final",
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
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
    const grades: CourseGradeItem[] = [
      {
        name: "Register Midterm",
        graderaw: 60,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Endterm",
        graderaw: 60,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Final",
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
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
    const grades: CourseGradeItem[] = [
      {
        name: "Register Midterm",
        graderaw: 60,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Endterm",
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Final",
        graderaw: 60,
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      "Retake 💀
      <b>TOTAL  →  42.00</b>
      <b>GPA  →  0.00</b>
      
      "
    `);
  });

  test("should return empty block (all null)", () => {
    const grades: CourseGradeItem[] = [
      {
        name: "Register Midterm",
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Endterm",
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Final",
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
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
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Endterm",
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
      {
        name: "Register Final",
        itemtype: "manual",
        grade_id: 1,
        grademax: 100,
        grademin: 0,
        iteminstance: 1,
        itemmodule: "assign",
        moodle_id: 1,
        cmid: 1,
        feedback: "",
        feedbackformat: 1,
      },
    ];

    expect(calculateGrades(grades)).toMatchInlineSnapshot(`
      ""
    `);
  });
});

describe("calculateGPA", () => {
  test("should return gpa", () => {
    expect(getGPA(100)).toStrictEqual("4.00");
    expect(getGPA(95)).toStrictEqual("4.00");
    expect(getGPA(90)).toStrictEqual("3.67");
    expect(getGPA(85)).toStrictEqual("3.33");
    expect(getGPA(80)).toStrictEqual("3.00");
    expect(getGPA(75)).toStrictEqual("2.67");
    expect(getGPA(70)).toStrictEqual("2.33");
    expect(getGPA(65)).toStrictEqual("2.00");
    expect(getGPA(60)).toStrictEqual("1.67");
    expect(getGPA(55)).toStrictEqual("1.33");
    expect(getGPA(50)).toStrictEqual("1.00");
  });
});
