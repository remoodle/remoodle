import { Hono } from "hono";
import { readSchedule } from "../../library/my-du/service";
import type { SessionEnv } from "../context";
import { browserRequest, requireSession } from "../middleware/session";

// Read-only: connecting, syncing, and disconnecting happen in the bot.
export const myDu = new Hono<SessionEnv>()
  .use(browserRequest, requireSession)
  .get("/", async (c) => c.json(await readSchedule(c.var.user.id), 200));
