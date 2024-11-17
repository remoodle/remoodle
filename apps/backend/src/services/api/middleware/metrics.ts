import { Gauge, Registry } from "prom-client";
import { prometheus } from "@hono/prometheus";
import { db } from "../../../library/db";

const registry = new Registry();
const userGauge = new Gauge({
  name: "user_counter",
  help: "Number of users",
  registers: [registry],
});

async function initUserCounter() {
  const userCount = await db.user.countDocuments();
  userGauge.inc(userCount);
}

const { printMetrics, registerMetrics } = prometheus({ registry });

export { userGauge, initUserCounter, printMetrics, registerMetrics };
