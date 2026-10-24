import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Pure modules and API types shared with the remoodle backend.
      "@remoodle": fileURLToPath(new URL("../remoodle/src", import.meta.url)),
    },
  },
  server: {
    // Keeps the session cookie first-party in development: the browser only sees :5173.
    proxy: { "/api": "http://localhost:3000" },
  },
});
