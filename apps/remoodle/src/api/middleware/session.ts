import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import { config, env } from "../../config";
import { findSessionUser, SESSION_TTL } from "../../library/auth";
import type { AppEnv, SessionEnv } from "../context";

const SESSION_COOKIE = "remoodle_session";

export function readSessionToken(c: Context) {
  return getCookie(c, SESSION_COOKIE);
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL / 1000,
  });
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

// Cookie-authenticated routes: never cache, and reject cross-site writes before the
// cookie is trusted. Same-site subdomains would otherwise pass SameSite=Lax.
export const browserRequest = createMiddleware<AppEnv>(async (c, next) => {
  c.header("Cache-Control", "no-store");

  if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    if (c.req.header("Origin") !== new URL(config.calendar.url).origin) {
      throw new HTTPException(403, { message: "Invalid request origin" });
    }
  }

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
