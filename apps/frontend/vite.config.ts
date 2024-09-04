import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { ValidateEnv as validateEnv } from "@julr/vite-plugin-validate-env";
import packageJson from "./package.json";

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig((config) => {
  const { mode } = config;

  const env = loadEnv(mode, process.cwd(), "");

  const sha = env.COMMIT_SHA;
  const buildInfo = {
    version: `${packageJson.version}${sha ? "." + sha.slice(0, 8) : ""}`,
  };

  return {
    resolve: {
      alias: {
        "@": resolve("./src"),
      },
    },
    define: {
      __BUILD_INFO__: JSON.stringify(buildInfo),
    },
    plugins: [vue(), vueDevTools(), validateEnv()],
  };
});
