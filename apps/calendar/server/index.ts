import { eq, and, lt, isNotNull } from "drizzle-orm";
import { Hono, type Context } from "hono";
import { createAuthMiddleware, type BetterAuthInstance } from "evlog/better-auth";
import { evlog, type EvlogVariables } from "evlog/hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import type { ExtraEnv } from "../env-extra";
import type { ScheduleFilter } from "../shared/schedule";
import { filterSchedule } from "../shared/schedule";
import { createAuth } from "./auth";
import { createDb } from "./db";
import { icalTokens, user as userTable, remoodleConnectTokens, myDuConnections } from "./db/schema";
import { generateIcal } from "./ical";
import {
  startLogin,
  completeLogin,
  readSchedule,
  syncSchedule,
  disconnect,
  syncDue,
  SYNC_INTERVAL,
} from "./my-du";

type Bindings = ExtraEnv & Env;
type AppEnv = {
  Bindings: Bindings;
} & EvlogVariables;
type AppContext = Context<AppEnv>;

const app = new Hono<AppEnv>();

function createEvlogAuth(env: Env): BetterAuthInstance {
  const auth = createAuth(env);

  return {
    api: {
      getSession: ({ headers }) => auth.api.getSession({ headers: headers as Headers }),
    },
  };
}

app.use("*", evlog());
app.use("*", async (c, next) => {
  const identify = createAuthMiddleware(createEvlogAuth(c.env), {
    exclude: ["/api/auth/**"],
  });

  await identify(c.get("log"), c.req.raw.headers, c.req.path);
  await next();
});
app.use("*", cors());

async function getSession(env: Env, headers: Headers) {
  const auth = createAuth(env);
  return auth.api.getSession({ headers });
}

async function requireSession(c: AppContext) {
  const session = await getSession(c.env, c.req.raw.headers);

  if (!session) {
    c.get("log").set({
      auth: {
        authenticated: false,
      },
    });
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  c.get("log").set({
    auth: {
      authenticated: true,
      mechanism: "session",
    },
  });

  return session;
}

function requireInternalToken(c: AppContext) {
  if (c.req.header("X-Internal-Token") !== c.env.INTERNAL_TOKEN) {
    c.get("log").set({
      auth: {
        authenticated: false,
        mechanism: "internal-token",
      },
    });
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  c.get("log").set({
    auth: {
      authenticated: true,
      mechanism: "internal-token",
    },
  });
}

app.use("/api/user/*", async (c, next) => {
  c.header("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    const origin = c.req.header("Origin");
    if (origin !== new URL(c.env.BETTER_AUTH_URL).origin)
      throw new HTTPException(403, { message: "Invalid request origin" });
  }
  await next();
});

const route = app
  .get("/api/user/schedule", async (c) => {
    const session = await requireSession(c);
    const db = createDb(c.env.DB);
    const [row] = await db
      .select()
      .from(myDuConnections)
      .where(eq(myDuConnections.userId, session.user.id));
    if (row && syncDue(row)) c.executionCtx.waitUntil(syncSchedule(c.env, session.user.id));
    return c.json(await readSchedule(c.env, session.user.id));
  })
  .post("/api/user/my-du/start", async (c) => {
    const session = await requireSession(c);
    return c.json(await startLogin(c.env, session.user.id));
  })
  .post("/api/user/my-du/connect", async (c) => {
    const session = await requireSession(c);
    if (Number(c.req.header("Content-Length") ?? 0) > 24_000)
      throw new HTTPException(413, { message: "Connection link is too long" });
    const body = await c.req.json<{
      callbackUrl: string;
      studyYear: number;
      term: number;
      firstWeekStart: string;
    }>();
    return c.json(await completeLogin(c.env, session.user.id, body));
  })
  .post("/api/user/my-du/sync", async (c) => {
    const session = await requireSession(c);
    const [row] = await createDb(c.env.DB)
      .select()
      .from(myDuConnections)
      .where(eq(myDuConnections.userId, session.user.id));
    if (!row?.credentials) throw new HTTPException(400, { message: "Connect My DU first." });
    if (!row.lastAttemptAt || row.lastAttemptAt < Date.now() - 60_000)
      await syncSchedule(c.env, session.user.id);
    return c.json(await readSchedule(c.env, session.user.id));
  })
  .delete("/api/user/my-du", async (c) => {
    const session = await requireSession(c);
    await disconnect(c.env, session.user.id);
    return c.json({ ok: true });
  })
  .all("/api/auth/**", async (c) => {
    const auth = createAuth(c.env);
    return auth.handler(c.req.raw);
  })
  .get("/api/ical/:token", async (c) => {
    const tokenParam = c.req.param("token");
    c.get("log").set({
      ical: {
        tokenProvided: true,
      },
    });
    const db = createDb(c.env.DB);

    const [tokenRow] = await db
      .select()
      .from(icalTokens)
      .where(eq(icalTokens.token, tokenParam))
      .limit(1);

    if (!tokenRow) {
      throw new HTTPException(404, { message: "Token not found" });
    }

    const { events: schedule } = await readSchedule(c.env, tokenRow.userId);
    if (!schedule) {
      throw new HTTPException(404, { message: "Schedule not found" });
    }

    c.get("log").set({
      ical: {
        hasFilters: Boolean(tokenRow.filters),
      },
    });

    let items = schedule;

    if (tokenRow.filters) {
      items = filterSchedule(items, tokenRow.filters);
    }

    const tokenFilters = (tokenRow.filters ?? {}) as ScheduleFilter;
    const rangeStart = tokenFilters.ical?.startDate
      ? new Date(`${tokenFilters.ical.startDate}T00:00:00`)
      : undefined;
    const rangeEnd = tokenFilters.ical?.endDate
      ? new Date(`${tokenFilters.ical.endDate}T00:00:00`)
      : undefined;

    const ical = generateIcal(items, new Date(), {
      combineAdjacentPairs: tokenFilters.ical?.combineAdjacentPairs,
      rangeStart,
      rangeEnd,
    });

    return new Response(ical, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="calendar.ics"',
      },
    });
  })
  .post("/api/user/remoodle-token", async (c) => {
    const session = await requireSession(c);

    const db = createDb(c.env.DB);

    // Delete any existing tokens for this user (one active at a time)
    await db.delete(remoodleConnectTokens).where(eq(remoodleConnectTokens.userId, session.user.id));

    // Generate a short human-friendly code with RE_ prefix
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const token =
      "RE_" +
      Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(remoodleConnectTokens).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      token,
      expiresAt,
      createdAt: new Date(),
    });

    c.get("log").set({
      remoodleConnect: {
        expiresAt: expiresAt.toISOString(),
      },
    });

    return c.json({ token, expiresAt: expiresAt.toISOString() });
  })
  .get("/api/user/ical-token", async (c) => {
    const session = await requireSession(c);

    const db = createDb(c.env.DB);
    const [tokenRow] = await db
      .select()
      .from(icalTokens)
      .where(eq(icalTokens.userId, session.user.id))
      .limit(1);

    if (!tokenRow) {
      return c.json(null);
    }

    const url = `${c.env.BETTER_AUTH_URL}/api/ical/${tokenRow.token}`;
    return c.json({
      token: tokenRow.token,
      url,
      filters: tokenRow.filters ?? null,
    });
  })
  .post("/api/user/ical-token", async (c) => {
    const session = await requireSession(c);

    const body = await c.req.json<{ filters: ScheduleFilter }>();

    c.get("log").set({
      ical: {
        hasFilters: Boolean(body.filters),
      },
    });

    const db = createDb(c.env.DB);

    const [existing] = await db
      .select()
      .from(icalTokens)
      .where(eq(icalTokens.userId, session.user.id))
      .limit(1);

    const token = crypto.randomUUID();

    if (existing) {
      await db
        .update(icalTokens)
        .set({ token, filters: body.filters ?? null, createdAt: new Date() })
        .where(eq(icalTokens.id, existing.id));
    } else {
      await db.insert(icalTokens).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        token,
        filters: body.filters ?? null,
        createdAt: new Date(),
      });
    }

    const url = `${c.env.BETTER_AUTH_URL}/api/ical/${token}`;
    return c.json({ token, url });
  })
  .patch("/api/user/ical-token", async (c) => {
    const session = await requireSession(c);

    const body = await c.req.json<{ filters: ScheduleFilter }>();

    c.get("log").set({
      ical: {
        hasFilters: Boolean(body.filters),
      },
    });

    const db = createDb(c.env.DB);

    const [existing] = await db
      .select()
      .from(icalTokens)
      .where(eq(icalTokens.userId, session.user.id))
      .limit(1);

    if (!existing) {
      throw new HTTPException(404, { message: "Token not found" });
    }

    await db
      .update(icalTokens)
      .set({ filters: body.filters ?? null })
      .where(eq(icalTokens.id, existing.id));

    return c.json({ ok: true });
  })
  .post("/api/internal/remoodle/connect", async (c) => {
    requireInternalToken(c);

    const { token } = await c.req.json<{ token: string }>();
    const db = createDb(c.env.DB);

    const [tokenRow] = await db
      .select()
      .from(remoodleConnectTokens)
      .where(eq(remoodleConnectTokens.token, token))
      .limit(1);

    if (!tokenRow || tokenRow.expiresAt < new Date()) {
      if (tokenRow) {
        await db.delete(remoodleConnectTokens).where(eq(remoodleConnectTokens.id, tokenRow.id));
      }
      throw new HTTPException(404, { message: "Token not found or expired" });
    }

    await db.delete(remoodleConnectTokens).where(eq(remoodleConnectTokens.id, tokenRow.id));

    const [u] = await db
      .select({
        id: userTable.id,
        email: userTable.email,
      })
      .from(userTable)
      .where(eq(userTable.id, tokenRow.userId))
      .limit(1);

    if (!u) {
      throw new HTTPException(404, { message: "User not found" });
    }

    c.get("log").set({
      remoodleConnect: {
        userId: u.id,
      },
    });

    return c.json({ userId: u.id, email: u.email });
  })
  .get("/api/internal/schedule/:userId", async (c) => {
    requireInternalToken(c);
    const { events } = await readSchedule(c.env, c.req.param("userId"));
    return c.json(events);
  });

app.onError((error, ctx) => {
  const status = error instanceof HTTPException ? error.status : 500;
  ctx.get("log").error(error, { status });
  return ctx.json(
    { status, message: status === 500 ? "Something went wrong. Please try again." : error.message },
    status,
  );
});

export type AppType = typeof route;

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, env: Bindings, ctx: ExecutionContext) {
    // A small batch each minute stays within the Worker subrequest budget.
    const rows = await createDb(env.DB)
      .select({ userId: myDuConnections.userId })
      .from(myDuConnections)
      .where(
        and(
          isNotNull(myDuConnections.credentials),
          lt(myDuConnections.lockUntil, Date.now()),
          lt(myDuConnections.lastAttemptAt, Date.now() - SYNC_INTERVAL),
        ),
      )
      .limit(1);
    for (const row of rows) ctx.waitUntil(syncSchedule(env, row.userId));
  },
};
