import { hc, parseResponse } from "hono/client";
import type { AppType } from "@remoodle/api/app";

// The session cookie belongs to the API origin, so every request must include credentials.
export const client = hc<AppType>(import.meta.env.VITE_API_URL ?? "/", {
  init: { credentials: "include" },
});

export { parseResponse };
