import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "../db";
import * as schema from "../db/schema";

type MicrosoftProvider = {
  clientId: string;
  tenantId: string;
  clientSecret?: string;
};

export function createAuth(env: Env) {
  const db = createDb(env.DB);

  const microsoftProvider: MicrosoftProvider = {
    clientId: env.MICROSOFT_CLIENT_ID,
    tenantId: env.MICROSOFT_TENANT_ID,
  };

  if (env.MICROSOFT_CLIENT_SECRET) {
    microsoftProvider.clientSecret = env.MICROSOFT_CLIENT_SECRET;
  }

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
    account: {
      accountLinking: {
        trustedProviders: ["microsoft"],
      },
    },
    socialProviders: {
      // github: {
      //   clientId: env.GITHUB_CLIENT_ID,
      //   clientSecret: env.GITHUB_CLIENT_SECRET,
      // },
      microsoft: microsoftProvider,
    },
  });
}
