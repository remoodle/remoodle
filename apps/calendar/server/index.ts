import { eq, and } from "drizzle-orm";
import { Hono, type Context } from "hono";
import { createAuthMiddleware, type BetterAuthInstance } from "evlog/better-auth";
import { evlog, type EvlogVariables } from "evlog/hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import type { ExtraEnv } from "../env-extra";
import type { GroupSchedule, Groups, ScheduleFilter } from "./types.d";
import { createAuth } from "./auth";
import { createDb } from "./db";
import { icalTokens, user as userTable, remoodleConnectTokens } from "./db/schema";
import { generateIcal } from "./ical";
import { getGroups, getGroupSchedule, putGroups, putGroupSchedule } from "./schedule";

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

function applyFilters(items: GroupSchedule, f: ScheduleFilter) {
  return items.filter((item) => {
    if (f.excludedCourses.includes(item.courseName)) return false;

    const isLearn = item.teacher.startsWith("https://learn");
    if (isLearn && !f.eventTypes.learn) return false;
    if (!isLearn && item.type === "lecture" && !f.eventTypes.lecture) return false;
    if (!isLearn && item.type === "practice" && !f.eventTypes.practice) return false;

    if (item.isOnline && !f.eventFormats.online) return false;
    if (!item.isOnline && !f.eventFormats.offline) return false;

    return true;
  });
}

const route = app
  .get("/api/groups", async (c) => {
    await requireSession(c);
    c.get("log").set({
      schedule: {
        scope: "groups",
      },
    });

    const groups = await getGroups(c.env.SCHEDULE_BUCKET);
    if (!groups) throw new HTTPException(404, { message: "Groups not found" });

    return c.json(groups);
  })
  .get("/api/groups/:group", async (c) => {
    await requireSession(c);
    c.get("log").set({
      schedule: {
        group: c.req.param("group"),
      },
    });

    const group = c.req.param("group");
    const schedule = await getGroupSchedule(c.env.SCHEDULE_BUCKET, group);

    return c.json(schedule ?? []);
  })
  .put("/api/groups", async (c) => {
    const groups = await c.req.json<Groups>();
    c.get("log").set({
      schedule: {
        scope: "groups",
      },
    });

    await putGroups(c.env.SCHEDULE_BUCKET, groups);

    return c.json({ ok: true });
  })
  .put("/api/groups/:group", async (c) => {
    const group = c.req.param("group");
    const schedule = await c.req.json<GroupSchedule>();
    c.get("log").set({
      schedule: {
        group,
      },
    });

    await putGroupSchedule(c.env.SCHEDULE_BUCKET, group, schedule);

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

    const schedule = await getGroupSchedule(c.env.SCHEDULE_BUCKET, tokenRow.group);
    if (!schedule) {
      throw new HTTPException(404, { message: "Schedule not found" });
    }

    c.get("log").set({
      ical: {
        group: tokenRow.group,
        hasFilters: Boolean(tokenRow.filters),
      },
    });

    let items = schedule;

    if (tokenRow.filters) {
      items = applyFilters(items, tokenRow.filters as ScheduleFilter);
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
  .get("/api/user/profile", async (c) => {
    const session = await requireSession(c);

    const db = createDb(c.env.DB);
    const [row] = await db
      .select({ primaryGroup: userTable.primaryGroup })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    return c.json({ primaryGroup: row?.primaryGroup ?? null });
  })
  .patch("/api/user/profile", async (c) => {
    const session = await requireSession(c);

    const { primaryGroup } = await c.req.json<{ primaryGroup: string }>();
    c.get("log").set({
      profile: {
        primaryGroup,
      },
    });

    const db = createDb(c.env.DB);
    await db
      .update(userTable)
      .set({ primaryGroup, updatedAt: new Date() })
      .where(eq(userTable.id, session.user.id));

    return c.json({ ok: true });
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

    const group = c.req.query("group");
    if (!group) {
      throw new HTTPException(400, { message: "group is required" });
    }

    c.get("log").set({
      ical: {
        group,
      },
    });

    const db = createDb(c.env.DB);
    const [tokenRow] = await db
      .select()
      .from(icalTokens)
      .where(and(eq(icalTokens.userId, session.user.id), eq(icalTokens.group, group)))
      .limit(1);

    if (!tokenRow) {
      return c.json(null);
    }

    const url = `${c.env.BETTER_AUTH_URL}/api/ical/${tokenRow.token}`;
    return c.json({
      token: tokenRow.token,
      group: tokenRow.group,
      url,
      filters: tokenRow.filters ?? null,
    });
  })
  .post("/api/user/ical-token", async (c) => {
    const session = await requireSession(c);

    const body = await c.req.json<{ group: string; filters: ScheduleFilter }>();
    if (!body.group) {
      throw new HTTPException(400, { message: "group is required" });
    }

    c.get("log").set({
      ical: {
        group: body.group,
        hasFilters: Boolean(body.filters),
      },
    });

    const db = createDb(c.env.DB);

    const [existing] = await db
      .select()
      .from(icalTokens)
      .where(and(eq(icalTokens.userId, session.user.id), eq(icalTokens.group, body.group)))
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
        group: body.group,
        filters: body.filters ?? null,
        createdAt: new Date(),
      });
    }

    const url = `${c.env.BETTER_AUTH_URL}/api/ical/${token}`;
    return c.json({ token, group: body.group, url });
  })
  .patch("/api/user/ical-token", async (c) => {
    const session = await requireSession(c);

    const body = await c.req.json<{ group: string; filters: ScheduleFilter }>();
    if (!body.group) {
      throw new HTTPException(400, { message: "group is required" });
    }

    c.get("log").set({
      ical: {
        group: body.group,
        hasFilters: Boolean(body.filters),
      },
    });

    const db = createDb(c.env.DB);

    const [existing] = await db
      .select()
      .from(icalTokens)
      .where(and(eq(icalTokens.userId, session.user.id), eq(icalTokens.group, body.group)))
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
        primaryGroup: userTable.primaryGroup,
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
        hasPrimaryGroup: Boolean(u.primaryGroup),
      },
    });

    return c.json({ userId: u.id, email: u.email, group: u.primaryGroup });
  })
  .get("/api/internal/schedule/:group", async (c) => {
    requireInternalToken(c);

    const group = c.req.param("group");
    c.get("log").set({
      schedule: {
        group,
        scope: "internal",
      },
    });
    const schedule = await getGroupSchedule(c.env.SCHEDULE_BUCKET, group);
    if (!schedule) {
      throw new HTTPException(404, { message: "Schedule not found" });
    }

    return c.json(schedule);
  });

app.onError((error, ctx) => {
  const status = error instanceof HTTPException ? error.status : 500;
  ctx.get("log").error(error, { status });
  return ctx.json({ status, message: error.message, stack: error.stack }, status);
});

export type AppType = typeof route;

export default app;
