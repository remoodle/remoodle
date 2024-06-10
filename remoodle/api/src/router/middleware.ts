import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyJwtToken, decodeJwtToken } from "../utils/jwt";

export function authMiddleware({
  publicPaths,
}: { publicPaths: string[] }): MiddlewareHandler {
  return async (ctx, next) => {
    console.log(ctx.req.path);
    // remove /x from the path
    ctx.req.path = ctx.req.path.replace(/^\/x/, "");
    if (publicPaths.includes(ctx.req.path)) {
      return await next();
    }

    const accessToken = ctx.req.header("Access-Token");

    if (!accessToken || !accessToken.length) {
      throw new HTTPException(401, {
        message: "Access-Token header is required",
      });
    }

    const valid = verifyJwtToken(accessToken);

    if (!valid) {
      throw new HTTPException(401, {
        message: "Access-Token is invalid",
      });
    }

    const payload = decodeJwtToken(accessToken);

    if (
      !payload ||
      typeof payload !== "object" ||
      !("userId" in payload) ||
      !("moodleId" in payload)
    ) {
      throw new HTTPException(403, {
        message: "Access-Token is missing userId or moodleId",
      });
    }

    ctx.set("userId", payload.userId);
    ctx.set("moodleId", payload.moodleId);

    await next();
  };
}

export function proxyMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const host = ctx.req.header("X-Forwarded-For");

    if (!host) {
      throw new HTTPException(401, {
        message: "Missing X-Forwarded-For header",
      });
    }

    ctx.set("host", host);

    return await next();
  };
}
