import { DetailedError, hc, parseResponse } from "hono/client";
import { z } from "zod";
import type { AppType } from "@remoodle/api/app";

// The session cookie belongs to the API origin, so every request must include credentials.
export const client = hc<AppType>(import.meta.env.VITE_API_URL ?? "/", {
  init: { credentials: "include" },
});

export { parseResponse };

const errorBody = z.object({ message: z.string() });

// The API answers rejected requests with `{ message }`; show that instead of the HTTP status.
export function apiErrorMessage(error: Error, fallback: string) {
  const body = error instanceof DetailedError ? errorBody.safeParse(error.detail?.data) : null;

  return body?.success ? body.data.message : fallback;
}
