import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { BetterAuthInstance } from "evlog/better-auth";
import { createAuth } from "../../lib/auth";
import type { AppEnv } from "../../context";

export type AppContext = Context<AppEnv>;

export function createEvlogAuth(env: Env): BetterAuthInstance {
  const auth = createAuth(env);

  return {
    api: {
      // SAFETY: Better Auth and evlog both use the platform Headers contract here.
      getSession: ({ headers }) => auth.api.getSession({ headers: headers as Headers }),
    },
  };
}

export async function requireSession(c: AppContext) {
  const session = await createAuth(c.env).api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.get("log").set({ auth: { authenticated: false } });
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  c.get("log").set({ auth: { authenticated: true, mechanism: "session" } });

  return session;
}

export function requireInternalToken(c: AppContext) {
  if (c.req.header("X-Internal-Token") !== c.env.INTERNAL_TOKEN) {
    c.get("log").set({ auth: { authenticated: false, mechanism: "internal-token" } });
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  c.get("log").set({ auth: { authenticated: true, mechanism: "internal-token" } });
}
