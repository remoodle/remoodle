// Augments the generated Env interface with secrets not tracked by wrangler types
export interface ExtraEnv {
  INTERNAL_TOKEN: string;
}
