import { and, eq, gt, isNotNull, isNull, lt } from "drizzle-orm";
import { db } from "../index";
import { loginRequests, sessions, users } from "../schema";

export async function createSession(tokenHash: string, userId: number, expiresAt: Date) {
  await db.insert(sessions).values({ tokenHash, userId, expiresAt });
}

export async function findSessionUser(tokenHash: string) {
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return row?.user;
}

export async function deleteSession(tokenHash: string) {
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function createLoginRequest(code: string, pollSecretHash: string, expiresAt: Date) {
  const now = new Date();
  await db.batch([
    db.delete(loginRequests).where(lt(loginRequests.expiresAt, now)),
    db.delete(sessions).where(lt(sessions.expiresAt, now)),
    db.insert(loginRequests).values({ code, pollSecretHash, expiresAt }),
  ]);
}

// Approval is one-shot: an already approved code cannot be re-pointed at another account.
export async function approveLoginRequest(code: string, userId: number) {
  const approved = await db
    .update(loginRequests)
    .set({ userId })
    .where(
      and(
        eq(loginRequests.code, code),
        gt(loginRequests.expiresAt, new Date()),
        isNull(loginRequests.userId),
      ),
    )
    .returning({ code: loginRequests.code });

  return approved.length === 1;
}

export async function findLoginRequestBySecret(pollSecretHash: string) {
  const [row] = await db
    .select()
    .from(loginRequests)
    .where(
      and(
        eq(loginRequests.pollSecretHash, pollSecretHash),
        gt(loginRequests.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return row;
}

export async function consumeLoginRequest(code: string) {
  const deleted = await db
    .delete(loginRequests)
    .where(and(eq(loginRequests.code, code), isNotNull(loginRequests.userId)))
    .returning({ userId: loginRequests.userId });

  return deleted[0]?.userId ?? null;
}
