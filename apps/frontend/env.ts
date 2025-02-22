import { defineConfig } from "@julr/vite-plugin-validate-env";
import { z } from "zod";

export default defineConfig({
  validator: "zod",
  schema: {
    VITE_SERVER_URL: z
      .string()
      .url()
      .optional()
      .default("http://localhost:9000/"),

    VITE_TELEGRAM_BOT_NAME: z.string().optional().default("remoodlebot"),
  },
});
