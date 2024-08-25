import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/app.ts"],
  clean: true,
  format: ["cjs"],
  target: "node20",
}));
