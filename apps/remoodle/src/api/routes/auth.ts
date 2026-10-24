import { Hono } from "hono";
import { config } from "../../config";
import { z } from "zod";
import {
  endSession,
  findSessionUser,
  pollTelegramLogin,
  startTelegramLogin,
} from "../../library/auth";
import { botStartUrl, START_PAYLOADS } from "../../library/bot-links";
import type { AppEnv } from "../context";
import { privateResponse, readSessionToken } from "../middleware/session";
import { jsonBody } from "../validator";

export const auth = new Hono<AppEnv>()
  .use(privateResponse)
  .get("/session", async (c) => {
    const token = readSessionToken(c);
    const user = token ? await findSessionUser(token) : undefined;

    return c.json(
      {
        user: user
          ? { name: user.name, username: user.username, telegramId: user.telegramId }
          : null,
        // Connections are managed in the bot; the calendar only links to these screens.
        links: {
          bot: config.telegram.url,
          myDu: botStartUrl(START_PAYLOADS.myDu),
          moodle: botStartUrl(START_PAYLOADS.moodle),
        },
      },
      200,
    );
  })
  .post("/telegram", async (c) => {
    const { pollSecret, url, expiresAt } = await startTelegramLogin();

    return c.json({ pollSecret, url, expiresAt }, 200);
  })
  .post(
    "/telegram/poll",
    jsonBody(z.object({ pollSecret: z.string().min(1).max(64) }), "Invalid sign-in request."),
    async (c) => {
      const result = await pollTelegramLogin(c.req.valid("json").pollSecret);

      // The caller stores the token; only the holder of `pollSecret` can ever receive it.
      return c.json(
        result.status === "approved"
          ? { status: result.status, token: result.token, expiresAt: result.expiresAt.getTime() }
          : { status: result.status },
        200,
      );
    },
  )
  .post("/logout", async (c) => {
    const token = readSessionToken(c);

    if (token) await endSession(token);

    return c.json({ ok: true }, 200);
  });
