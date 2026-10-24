import type { HonoLogLayerVariables } from "@loglayer/hono";
import type { User } from "../db/repositories/users";

export type AppEnv = { Variables: HonoLogLayerVariables };

export type SessionEnv = { Variables: HonoLogLayerVariables & { user: User } };
