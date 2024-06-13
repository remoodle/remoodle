import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { verifyJwtToken, decodeJwtToken } from "../utils/jwt";
import { config } from "../config";
import { User } from "../database";

export function proxyMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const host = ctx.req.header("X-Forwarded-Host");

    if (!host) {
      throw new HTTPException(401, {
        message: "Missing X-Forwarded-Host header",
      });
    }

    console.log("proxying to ", host);

    ctx.set("host", host);

    return await next();
  };
}

export function authMiddleware({
  excludePaths,
}: { excludePaths: string[] }): MiddlewareHandler {
  return async (ctx, next) => {
    // remove /x from the path
    ctx.req.path = ctx.req.path.replace(/^\/x/, "");
    if (excludePaths.includes(ctx.req.path)) {
      return await next();
    }

    const authorization = ctx.req.header("Authorization");

    if (authorization) {
      const [token, telegramId] = authorization.split("::");

      if (token !== `Bearer ${config.internal.secret}`) {
        throw new HTTPException(403, {
          message: "Forbidden",
        });
      }

      const user = await User.findOne({ telegramId });

      if (!user) {
        throw new HTTPException(403, {
          message: "Forbidden",
        });
      }

      ctx.set("userId", user._id);
      ctx.set("moodleId", user.moodleId);

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
