import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import { findSessionUser } from "../../library/auth";
import type { AppEnv, SessionEnv } from "../context";

// The calendar's server keeps the session token in its own httpOnly cookie and forwards it here.
// Browsers never send this header on their own, so these routes need no CSRF defence.
export function readSessionToken(c: Context) {
  const header = c.req.header("Authorization");

  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
}

// Personal data must never be cached between users by a proxy.
export const privateResponse = createMiddleware<AppEnv>(async (c, next) => {
  c.header("Cache-Control", "no-store");
  await next();
});

export const requireSession = createMiddleware<SessionEnv>(async (c, next) => {
  const token = readSessionToken(c);
  const user = token ? await findSessionUser(token) : undefined;

  if (!user) throw new HTTPException(401, { message: "Sign in to continue." });

  c.var.logger.withContext({ userId: user.id });
  c.set("user", user);
  await next();
});
