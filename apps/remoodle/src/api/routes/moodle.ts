import { Hono } from "hono";
import { readMoodle } from "../../library/moodle/service";
import type { SessionEnv } from "../context";
import { browserRequest, requireSession } from "../middleware/session";

// Read-only: the calendar URL is set in the bot.
export const moodle = new Hono<SessionEnv>()
  .use(browserRequest, requireSession)
  .get("/", async (c) => c.json(await readMoodle(c.var.user.moodleCalendarUrl), 200));
