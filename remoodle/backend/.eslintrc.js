/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@remoodle/eslint-config/common.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
};
