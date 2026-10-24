import { fileURLToPath, URL } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [
    // Dev and build both run the server in workerd, the same runtime as production. Unit tests
    // cover pure modules only and run in Node; the plugin rejects Vitest's SSR environment.
    !process.env.VITEST && cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    // Must come after the Start plugin.
    viteReact(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Pure modules and API types shared with the remoodle backend.
      "@remoodle": fileURLToPath(new URL("../remoodle/src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
