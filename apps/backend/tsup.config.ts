import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: ["src/app.ts"],
  clean: true,
  format: ["cjs"],
  target: "node20",
  noExternal: ["@remoodle/utils", "@remoodle/db"],
}));
