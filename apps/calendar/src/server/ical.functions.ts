import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { scheduleFilterSchema } from "@remoodle/library/schedule/items";
import { readApi } from "./remoodle-api.server";
import { sessionMiddleware } from "./session-middleware";

const filtersInput = z.object({ filters: scheduleFilterSchema });

/** The subscription URL and the filters it was saved with, or `null` before one exists. */
export const getIcalSubscription = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(({ context }) => readApi(context.api["ical-token"].$get()));

/** Issues a new URL; any previous URL stops working. */
export const createIcalSubscription = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .validator(filtersInput)
  .handler(({ context, data }) => readApi(context.api["ical-token"].$post({ json: data })));

export const updateIcalSubscription = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .validator(filtersInput)
  .handler(({ context, data }) => readApi(context.api["ical-token"].$patch({ json: data })));
