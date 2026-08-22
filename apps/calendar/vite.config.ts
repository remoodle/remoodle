import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";
import evlog from "evlog/vite";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [evlog({ service: "calendar-api" }), vue(), vueDevTools(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
