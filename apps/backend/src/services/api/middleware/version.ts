import type { MiddlewareHandler } from "hono";

export const versionHandler: MiddlewareHandler = (ctx, next) => {
  // eslint-disable-next-line
  ctx.header("Version", process.env.VERSION_TAG || "");
  ctx.header("Access-Control-Expose-Headers", "Version");

  return next();
};
