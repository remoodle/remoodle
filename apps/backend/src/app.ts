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
  console.error(err, "Uncaught exception");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error({ promise, reason }, "Unhandled Rejection at: Promise");
});
