import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../db";
import type { AppEnv } from "../../context";
import { requireInternalToken, requireSession } from "../middleware/auth";
import { findConnection } from "../../lib/my-du/repository";
import {
  completeLogin,
  disconnect,
  readSchedule,
  startLogin,
  syncDue,
  syncSchedule,
} from "../../lib/my-du/service";

export const myDuController = new Hono<AppEnv>()
  .get("/api/user/schedule", async (c) => {
    const session = await requireSession(c);
    const row = await findConnection(createDb(c.env.DB), session.user.id);
    if (row && syncDue(row)) c.executionCtx.waitUntil(syncSchedule(c.env, session.user.id));
    const schedule = await readSchedule(c.env, session.user.id);
    return c.json(schedule);
  })
  .post("/api/user/my-du/start", async (c) => {
    const session = await requireSession(c);
    const login = await startLogin(c.env, session.user.id);
    return c.json(login);
  })
  .post("/api/user/my-du/connect", async (c) => {
    const session = await requireSession(c);
    if (Number(c.req.header("Content-Length") ?? 0) > 24_000) {
      throw new HTTPException(413, { message: "Connection link is too long" });
    }
    const body: unknown = await c.req.json();
    const schedule = await completeLogin(c.env, session.user.id, body);
    return c.json(schedule);
  })
  .post("/api/user/my-du/sync", async (c) => {
    const session = await requireSession(c);
    const row = await findConnection(createDb(c.env.DB), session.user.id);
    if (!row?.credentials) throw new HTTPException(400, { message: "Connect My DU first." });
    if (!row.lastAttemptAt || row.lastAttemptAt < Date.now() - 60_000) {
      await syncSchedule(c.env, session.user.id);
    }
    const schedule = await readSchedule(c.env, session.user.id);
    return c.json(schedule);
  })
  .delete("/api/user/my-du", async (c) => {
    const session = await requireSession(c);
    await disconnect(c.env, session.user.id);
    return c.json({ ok: true });
  })
  .get("/api/internal/schedule/:userId", async (c) => {
    requireInternalToken(c);
    const schedule = await readSchedule(c.env, c.req.param("userId"));
    return c.json(schedule.events);
  });
