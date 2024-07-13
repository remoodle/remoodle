import type { MiddlewareHandler } from "hono";
import { getCoreInternalHeaders, requestCore } from "../../../http/core";
import type { APIMethod } from "../../../http/core";

export function proxyRequest(endpoint: APIMethod): MiddlewareHandler {
  return async (ctx) => {
    const [method, pathTemplate] = endpoint;

    let actualPath;
    if (pathTemplate.includes("*")) {
      const basePath = pathTemplate.split("*")[0];

      const pathSuffix = ctx.req.path.substring(basePath.length - 1);

      actualPath = basePath.slice(0, -1) + pathSuffix;
    } else {
      actualPath = pathTemplate;
    }

    const queryString = ctx.req.url.includes("?")
      ? ctx.req.url.split("?")[1]
      : "";

    if (queryString) {
      actualPath += `?${queryString}`;
    }

    const [response, error] = await requestCore([method, actualPath], {
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
