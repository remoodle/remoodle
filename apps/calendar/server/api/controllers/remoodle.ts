import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { createDb } from "../../db";
import { remoodleConnectTokens, user } from "../../db/schema";
import type { AppEnv } from "../../context";
import { requireInternalToken, requireSession } from "../middleware/auth";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const bodySchema = z.object({ token: z.string().trim().min(1).max(32) });

function createToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return "RE_" + Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export const remoodleController = new Hono<AppEnv>()
  .post("/api/user/remoodle-token", async (c) => {
    const session = await requireSession(c);
    const db = createDb(c.env.DB);
    const token = createToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60_000);
    await db.batch([
      db.delete(remoodleConnectTokens).where(eq(remoodleConnectTokens.userId, session.user.id)),
      db.insert(remoodleConnectTokens).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        token,
        expiresAt,
        createdAt: now,
      }),
    ]);
    c.get("log").set({ remoodleConnect: { expiresAt: expiresAt.toISOString() } });
    const result = { token, expiresAt: expiresAt.toISOString() };
    return c.json(result);
  })
  .post("/api/internal/remoodle/connect", async (c) => {
    requireInternalToken(c);
    const parsed = bodySchema.safeParse(await c.req.json());
    if (!parsed.success) throw new HTTPException(400, { message: "Invalid connection token" });
    const db = createDb(c.env.DB);
    const [tokenRow] = await db
      .delete(remoodleConnectTokens)
      .where(eq(remoodleConnectTokens.token, parsed.data.token))
      .returning();
    if (!tokenRow || tokenRow.expiresAt < new Date()) {
      throw new HTTPException(404, { message: "Token not found or expired" });
    }
    const [account] = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.id, tokenRow.userId))
      .limit(1);
    if (!account) throw new HTTPException(404, { message: "User not found" });
    c.get("log").set({ remoodleConnect: { userId: account.id } });
    const result = { userId: account.id, email: account.email };
    return c.json(result);
  });
