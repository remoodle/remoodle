import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { ValidateEnv as validateEnv } from "@julr/vite-plugin-validate-env";
import injectBuildInfo, { getBuildInfo } from "./plugins/build-info";
import { getRollupPlugins } from "./plugins/rollup-options";
import packageJson from "./package.json";

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig((config) => {
  const { mode } = config;

  const env = loadEnv(mode, process.cwd(), "");

  const buildInfo = getBuildInfo({
    sha: env.COMMIT_SHA,
    packageJson,
  });

  return {
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()],
      },
    },
    resolve: {
      alias: {
        "@": resolve("./src"),
      },
    },
    plugins: [vue(), vueDevTools(), validateEnv(), injectBuildInfo(buildInfo)],
    build: {
      rollupOptions: {
        plugins: getRollupPlugins(),
      },
    },
  };
});
