import { HatchetClient } from "@hatchet-dev/typescript-sdk";
import { config } from "../config";
import { createHatchetLogger } from "./hatchet-logger";

export const hatchet = HatchetClient.init({
  token: config.hatchet.token,
  log_level: "INFO",
  logger: createHatchetLogger,
});
