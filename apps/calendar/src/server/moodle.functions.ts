import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { readApi } from "./remoodle-api.server";
import { sessionMiddleware } from "./session-middleware";

// Fetches the user's Moodle export live, so it is never cached between page loads.
export const getMoodleEvents = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(({ context }) => readApi(context.api.moodle.$get()));

export const connectMoodle = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .validator(z.object({ url: z.string().trim().min(1).max(4096) }))
  .handler(({ context, data }) => readApi(context.api.moodle.$put({ json: data })));

export const disconnectMoodle = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .handler(({ context }) => readApi(context.api.moodle.$delete()));
