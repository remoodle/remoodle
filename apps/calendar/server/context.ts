import type { EvlogVariables } from "evlog/hono";
import type { ExtraEnv } from "../env-extra";

export type Bindings = ExtraEnv & Env;

export type AppEnv = { Bindings: Bindings } & EvlogVariables;
