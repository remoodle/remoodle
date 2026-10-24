import { createServerFn } from "@tanstack/react-start";
import { myDuConnectSchema, myDuPeriodSchema } from "@remoodle/library/my-du/schemas";
import { readApi } from "./remoodle-api.server";
import { sessionMiddleware } from "./session-middleware";

export const getMyDuSchedule = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(({ context }) => readApi(context.api["my-du"].$get()));

/** Returns the Microsoft sign-in link whose final address the user pastes into `connectMyDu`. */
export const startMyDuSignIn = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .handler(({ context }) => readApi(context.api["my-du"].start.$post()));

export const connectMyDu = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .validator(myDuConnectSchema)
  .handler(({ context, data }) => readApi(context.api["my-du"].connect.$post({ json: data })));

export const changeMyDuPeriod = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .validator(myDuPeriodSchema)
  .handler(({ context, data }) => readApi(context.api["my-du"].period.$put({ json: data })));

export const syncMyDu = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .handler(({ context }) => readApi(context.api["my-du"].sync.$post()));

export const disconnectMyDu = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .handler(({ context }) => readApi(context.api["my-du"].$delete()));
