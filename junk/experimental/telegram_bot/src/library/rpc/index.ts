import { hc } from "hono/client";
import type { AppType } from "@remoodle/backend";

const client = hc<AppType>("http://localhost:9000/");

export { client };
