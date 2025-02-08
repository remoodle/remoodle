import { defineConfig } from "tsup";

export default defineConfig(() => ({
  entry: ["src/", "!src/**/*.spec.ts"],
  clean: true,
  format: ["cjs"],
  target: "node20",
  loader: {
    ".json": "copy",
  },
  noExternal: ["@remoodle/utils", "@remoodle/db"],
}));
