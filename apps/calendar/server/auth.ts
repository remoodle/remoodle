import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "./db";
import * as schema from "./db/schema";

export function createAuth(env: Env) {
  const db = createDb(env.DB);
  const microsoftProvider = {
    clientId: env.MICROSOFT_CLIENT_ID,
    tenantId: env.MICROSOFT_TENANT_ID,
    ...(env.MICROSOFT_CLIENT_SECRET ? { clientSecret: env.MICROSOFT_CLIENT_SECRET } : {}),
  };

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    basePath: "/api/auth",
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
      microsoft: microsoftProvider,
    },
  });
}
