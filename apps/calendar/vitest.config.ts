import { mergeConfig } from "vite-plus";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, { test: { include: ["src/**/*.spec.ts"] } });
