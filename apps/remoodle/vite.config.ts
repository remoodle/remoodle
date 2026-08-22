import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/**/*.ts", "!src/**/*.spec.ts", "!src/library/i18n/**"],
    exports: false,
    onSuccess: "cp -r src/db/migrations dist/db/migrations",
  },
});
