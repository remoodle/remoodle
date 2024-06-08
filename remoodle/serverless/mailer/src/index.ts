import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", cors());

app.post("/mail/send", async (ctx) => {
  return ctx.text("OK", 200);
});

export default app;
