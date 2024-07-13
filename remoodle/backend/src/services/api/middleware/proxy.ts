import type { MiddlewareHandler } from "hono";
import { getCoreInternalHeaders, requestCore } from "../../../http/core";

export function proxyRequest(): MiddlewareHandler {
  return async (ctx, next) => {
    console.log("Proxying request to", ctx.req.path);
    const [response, error] = await requestCore(ctx.req.path, {
      method: ctx.req.method,
      body: ctx.req.raw.body,
      ...(ctx.get("moodleId") && {
        headers: getCoreInternalHeaders(ctx.get("moodleId")),
      }),
    });

    if (error) {
      throw error;
    }

    return ctx.json(response.data, response.status);
  };
}
