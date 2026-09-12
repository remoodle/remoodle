import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { validator } from "hono/validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDb } from "../../db";
import { moodleConnections } from "../../db/schema";
import { fetchMoodleFeed, validateMoodleUrl } from "../../lib/moodle/feed";
import type { AppEnv } from "../../context";
import { requireInternalToken, requireSession } from "../middleware/auth";
import { connectMoodle, readMoodle } from "../../lib/moodle";

const connectSchema = z.object({ url: z.string() });

export const moodleController = new Hono<AppEnv>()
  .get("/api/user/moodle", async (c) => {
    const session = await requireSession(c);
    c.header("Cache-Control", "private, no-store");
    const moodle = await readMoodle(c.env, session.user.id);

    return c.json(moodle);
  })
  .post(
    "/api/user/moodle",
    validator("json", (value) => connectSchema.parse(value)),
    async (c) => {
      const session = await requireSession(c);
      const body = c.req.valid("json");
      let url: string;

      try {
        url = validateMoodleUrl(body.url);
      } catch (error) {
        throw new HTTPException(400, {
          message: "Use the calendar export URL from AITU Moodle.",
          cause: error,
        });
      }

      try {
        const moodle = await connectMoodle(c.env, session.user.id, url);

        return c.json(moodle);
      } catch (error) {
        throw new HTTPException(400, {
          message: "Could not open this Moodle calendar. Generate a new calendar URL in Moodle.",
          cause: error,
        });
      }
    },
  )
  .delete("/api/user/moodle", async (c) => {
    const session = await requireSession(c);
    await createDb(c.env.DB)
      .delete(moodleConnections)
      .where(eq(moodleConnections.userId, session.user.id));

    return c.json({ ok: true });
  })
  .get("/api/internal/moodle/:userId", async (c) => {
    requireInternalToken(c);
    c.header("Cache-Control", "private, no-store");
    const moodle = await readMoodle(c.env, c.req.param("userId"));

    return c.json(moodle);
  })
  .post(
    "/api/internal/moodle/feed",
    validator("json", (value) => connectSchema.parse(value)),
    async (c) => {
      requireInternalToken(c);
      const body = c.req.valid("json");
      const url = validateMoodleUrl(body.url);
      const events = await fetchMoodleFeed(url);

      return c.json({ events, fetchedAt: Date.now() });
    },
  )
  .post(
    "/api/internal/moodle/:userId",
    validator("json", (value) => connectSchema.parse(value)),
    async (c) => {
      requireInternalToken(c);
      const body = c.req.valid("json");

      try {
        const moodle = await connectMoodle(c.env, c.req.param("userId"), body.url);

        return c.json(moodle);
      } catch (error) {
        throw new HTTPException(400, {
          message: "Could not open this Moodle calendar. Generate a new calendar URL in Moodle.",
          cause: error,
        });
      }
    },
  );
