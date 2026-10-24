import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { HTTPException } from "hono/http-exception";
import { myDuConnectSchema, myDuPeriodSchema } from "../../library/my-du/schemas";
import {
  changePeriod,
  completeLogin,
  disconnect,
  readSchedule,
  requestSync,
  startLogin,
} from "../../library/my-du/service";
import type { SessionEnv } from "../context";
import { privateResponse, requireSession } from "../middleware/session";
import { jsonBody } from "../validator";

// The web counterpart of the bot's /mydu screen; both call the same service.
export const myDu = new Hono<SessionEnv>()
  .use(privateResponse, requireSession)
  .get("/", async (c) => c.json(await readSchedule(c.var.user.id), 200))
  .post("/start", async (c) => c.json(await startLogin(c.var.user.id), 200))
  .post(
    "/connect",
    bodyLimit({
      maxSize: 24_000,
      onError: () => {
        throw new HTTPException(413, { message: "Connection link is too long." });
      },
    }),
    jsonBody(
      myDuConnectSchema,
      "Check the connection link, period, and Monday of teaching week 1.",
    ),
    async (c) => {
      const { callbackUrl, ...period } = c.req.valid("json");

      return c.json(await completeLogin(c.var.user.id, callbackUrl, period), 200);
    },
  )
  .put(
    "/period",
    jsonBody(myDuPeriodSchema, "Check the period and Monday of teaching week 1."),
    async (c) => c.json(await changePeriod(c.var.user.id, c.req.valid("json")), 200),
  )
  .post("/sync", async (c) => c.json(await requestSync(c.var.user.id), 200))
  .delete("/", async (c) => {
    await disconnect(c.var.user.id);

    return c.json(await readSchedule(c.var.user.id), 200);
  });
