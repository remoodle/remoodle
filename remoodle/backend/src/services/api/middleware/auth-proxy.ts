import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { config } from "../../../config";
import { db } from "../../../database";
import { decodeJwtToken, verifyJwtToken } from "../../../utils/jwt";

export function authMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const authorization = ctx.req.header("Authorization");

    if (authorization) {
      const [token, telegramId] = authorization.split("::");

      if (token !== `Bearer ${config.http.secret}`) {
        throw new HTTPException(403, {
          message: "Forbidden",
        });
      }

      const user = await db.user.findOne({ telegramId });

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
