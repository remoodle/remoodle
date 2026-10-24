import { DetailedError, hc, parseResponse, type ClientResponse } from "hono/client";
import { z } from "zod";
import type { AppType } from "@remoodle/api/app";

const errorBody = z.object({ message: z.string() });

// Read per request: Workers inject `vars` at request time, so a module-scope read is undefined.
function apiUrl() {
  const url = process.env.API_URL;

  if (!url) throw new Error("API_URL is not configured.");

  return url;
}

/** The remoodle API, called server-to-server with the session token as a bearer credential. */
export function remoodleApi(token?: string) {
  return hc<AppType>(apiUrl(), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}

/**
 * Parses an API response. Rejections keep the API's user-facing `{ message }`, which survives
 * server function serialization to the client; anything else becomes a generic message.
 */
export async function readApi<Response extends ClientResponse<unknown>>(
  request: Promise<Response>,
) {
  try {
    return await parseResponse(request);
  } catch (cause) {
    const body = cause instanceof DetailedError ? errorBody.safeParse(cause.detail?.data) : null;

    throw new Error(body?.success ? body.data.message : "Could not reach Remoodle. Try again.", {
      cause,
    });
  }
}
