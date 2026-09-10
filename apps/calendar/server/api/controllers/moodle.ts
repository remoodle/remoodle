import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDb } from "../../db";
import { moodleConnections } from "../../db/schema";
import { fetchMoodleFeed, validateMoodleUrl } from "../../lib/moodle/feed";
import { encryptSecret } from "../../lib/crypto";
import type { AppEnv } from "../../context";
import { requireInternalToken, requireSession } from "../middleware/auth";
import { readMoodle } from "../../lib/moodle";

const connectSchema = z.object({ url: z.unknown() });

export const moodleController = new Hono<AppEnv>()
  .get("/api/user/moodle", async (c) => {
    const session = await requireSession(c);
    c.header("Cache-Control", "private, no-store");
    const moodle = await readMoodle(c.env, session.user.id);
    return c.json(moodle);
  })
  .post("/api/user/moodle", async (c) => {
    const session = await requireSession(c);
    const body = connectSchema.parse(await c.req.json());
    let url: string;
    try {
      url = validateMoodleUrl(body.url);
    } catch (error) {
      throw new HTTPException(400, {
        message: "Use the calendar export URL from AITU Moodle.",
        cause: error,
      });
    }
    let events;
    try {
      events = await fetchMoodleFeed(url);
    } catch (error) {
      throw new HTTPException(400, {
        message: "Could not open this Moodle calendar. Generate a new calendar URL in Moodle.",
        cause: error,
      });
    }
    const encryptedUrl = await encryptSecret(
      url,
      c.env.BETTER_AUTH_SECRET,
      "moodle:" + session.user.id,
    );
    await createDb(c.env.DB)
      .insert(moodleConnections)
      .values({ userId: session.user.id, encryptedUrl })
      .onConflictDoUpdate({ target: moodleConnections.userId, set: { encryptedUrl } });
    const moodle = { connection: { connected: true }, events, fetchedAt: Date.now() };
    return c.json(moodle);
  })
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
  });
