import { defineConfig } from "vite-plus";

export default defineConfig({ test: { include: ["server/**/*.spec.ts", "shared/**/*.spec.ts"] } });
