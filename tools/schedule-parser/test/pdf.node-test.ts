import assert from "node:assert/strict";
import test from "node:test";
import { extractGroupsFromText } from "../src/pdf.js";

test("extracts and ignores malformed group lines", () => {
  assert.deepEqual(
    extractGroupsFromText("Group SE-2401\nTeacher\nNot Group X\nGroup CS-2402"),
    ["SE-2401", "CS-2402"],
  );
});
