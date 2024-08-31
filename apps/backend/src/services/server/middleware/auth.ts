import type { Context, MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { config } from "../../../config";
import { db } from "../../../library/db";
import { decodeJwtToken, verifyJwtToken } from "../helpers/jwt";

type AuthScheme = "Telegram" | "Bearer";

const validateAuthorization = (ctx: Context): [AuthScheme, string] => {
  const authorization = ctx.req.header("Authorization");

  if (!authorization) {
    throw new HTTPException(403, {
      message: "Authorization header is required",
    });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Telegram" && scheme !== "Bearer") {
    throw new HTTPException(403, { message: "Invalid authorization scheme" });
  }

  if (!token || !token.length) {
    throw new HTTPException(401, { message: "Token is required" });
  }

  return [scheme as AuthScheme, token];
};

const handleTelegramAuth = async (ctx: Context, token: string) => {
  const [secret, telegramId, withUser = "1"] = token.split("::");

  if (secret !== `${config.http.secret}`) {
    throw new HTTPException(403, { message: "Forbidden" });
  }

  ctx.set("telegramId", telegramId);

  if (withUser !== "0") {
    const user = await db.user.findOne({ telegramId });

    if (!user) {
      throw new HTTPException(403, { message: "Forbidden" });
    }

    ctx.set("userId", user._id);
    ctx.set("moodleId", user.moodleId);
  }
};

const handleJwtAuth = (ctx: Context, token: string) => {
  const valid = verifyJwtToken(token);

  if (!valid) {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  const payload = decodeJwtToken(token);

  if (
    !payload ||
    typeof payload !== "object" ||
    !("userId" in payload) ||
    !("moodleId" in payload)
  ) {
    throw new HTTPException(403, {
      message: "Token is missing required fields",
    });
  }

  ctx.set("userId", payload.userId);
  ctx.set("moodleId", payload.moodleId);
};

export const authMiddleware = (
  allowedSchemes: AuthScheme[] = ["Telegram", "Bearer"],
): MiddlewareHandler => {
  return async (ctx, next) => {
    const [scheme, token] = validateAuthorization(ctx);

    if (!allowedSchemes.includes(scheme)) {
      throw new HTTPException(403, {
        message: "Unauthorized authentication scheme",
      });
    }

    if (scheme === "Telegram") {
      await handleTelegramAuth(ctx, token);
    } else {
      handleJwtAuth(ctx, token);
    }

    await next();
  };
};
