import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { config } from "../../../config";
import { db } from "../../../library/db";
import { decodeJwtToken, verifyJwtToken } from "../helpers/jwt";

export function authMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization#syntax
    // Authorization: <auth-scheme> <authorization-parameters>
    // example: Bearer <token>
    // example: Telegram <secret>::<telegram-id>::<with-user (1 or 0)>
    const authorization = ctx.req.header("Authorization");

    if (!authorization) {
      throw new HTTPException(403, {
        message: "Authorization header is required",
      });
    }

    const [scheme, authorizationParameters] = authorization.split(" ");

    // TG bot auth
    if (scheme === "Telegram") {
      const [secret, telegramId, withUser = "1"] =
        authorizationParameters.split("::");

      if (secret !== `${config.http.secret}`) {
        throw new HTTPException(403, {
          message: "Forbidden",
        });
      }

      ctx.set("telegramId", telegramId);

      if (withUser !== "0") {
        const user = await db.user.findOne({ telegramId });

        console.log(user);
        if (!user) {
          throw new HTTPException(403, {
            message: "Forbidden",
          });
        }

        ctx.set("userId", user._id);
        ctx.set("moodleId", user.moodleId);
      }

      return await next();
    }

    // Bearer auth (JWT, web app)
    if (scheme === "Bearer") {
      const token = authorizationParameters;

      if (!token || !token.length) {
        throw new HTTPException(401, {
          message: "Access-Token header is required",
        });
      }

      const valid = verifyJwtToken(token);

      if (!valid) {
        throw new HTTPException(401, {
          message: "Access-Token is invalid",
        });
      }

      const payload = decodeJwtToken(token);

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
    }

    await next();
  };
}
