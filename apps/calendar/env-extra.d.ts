// Augments the generated Env interface with secrets not tracked by wrangler types
export interface ExtraEnv {
  INTERNAL_TOKEN: string;
}

declare global {
  interface Env {
    BETTER_AUTH_SECRET: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    MICROSOFT_CLIENT_ID: string;
    MICROSOFT_CLIENT_SECRET: string;
    INTERNAL_TOKEN: string;
  }
}
