import { DetailedError, hc, parseResponse } from "hono/client";
import type { AppType } from "../../../server/index.ts";

export const client = hc<AppType>("/");

export { DetailedError, parseResponse };
