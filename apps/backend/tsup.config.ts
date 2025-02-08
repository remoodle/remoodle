import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: ["src/**/*.ts", "!src/**/*.spec.ts"],
  bundle: false,
  clean: true,
  format: ["cjs"],
  target: "node20",
  noExternal: ["@remoodle/utils", "@remoodle/db"],
}));
