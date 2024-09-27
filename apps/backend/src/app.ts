import { logger } from "./library/logger";
import { config } from "./config";
import { startServer } from "./services/server";
import { startNotifier } from "./services/notifier";

if (config.app.services.includes("api")) {
  startServer();
}

if (config.app.services.includes("notifier")) {
  startNotifier();
}

process.on("uncaughtException", function (err) {
  logger.common.fatal(err, "uncaught exception detected");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.common.fatal({ promise, reason }, "unhandled Rejection at: Promise");
});
