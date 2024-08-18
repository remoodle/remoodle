import { createHC } from "@remoodle/hc-wrapper";
import type { AppType } from "@remoodle/backend";

const { request } = createHC<AppType>("http://localhost:9000/");

export { request };
