import { Hono } from "hono";
import { z } from "zod";
import { connectMoodle, disconnectMoodle, readMoodle } from "../../library/moodle/service";
import type { SessionEnv } from "../context";
import { privateResponse, requireSession } from "../middleware/session";
import { jsonBody } from "../validator";

// The web counterpart of the bot's Moodle URL prompt; both call the same service.
export const moodle = new Hono<SessionEnv>()
  .use(privateResponse, requireSession)
  .get("/", async (c) => c.json(await readMoodle(c.var.user.moodleCalendarUrl), 200))
  .put(
    "/",
    jsonBody(
      z.object({ url: z.string().trim().min(1).max(4096) }),
      "Paste your Moodle calendar URL.",
    ),
    async (c) => c.json(await connectMoodle(c.var.user.id, c.req.valid("json").url), 200),
  )
  .delete("/", async (c) => {
    await disconnectMoodle(c.var.user.id);

    return c.json(await readMoodle(null), 200);
  });
