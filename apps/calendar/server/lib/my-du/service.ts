import type { ScheduleItem } from "../../../shared/schedule";
import { HTTPException } from "hono/http-exception";
import { createDb } from "../../db";
import { createMyDuClient, exchangeLoginCode, MY_DU_ORIGIN, MyDuConnectionError } from "./client";
import { decryptCredentials, encryptCredentials } from "./credentials";
import {
  acquireSyncLease,
  consumeLoginRequest,
  disconnectConnection,
  findConnection,
  findLoginRequest,
  releaseSyncLease,
  replaceConnection,
  saveLoginRequest,
  saveSchedule,
  saveSyncError,
  updateCredentials,
  type MyDuConnection,
} from "./repository";
import { normalizeWeek } from "./schedule";
import { connectMyDuSchema, parseMyDuResponse, termLengthSchema } from "./schemas";

const LOGIN_TTL = 10 * 60_000;
const SYNC_LEASE = 12 * 60_000;
export const SYNC_INTERVAL = 24 * 60 * 60_000;

function parseCallback(callbackUrl: string, state: string) {
  let url: URL;
  try {
    url = new URL(callbackUrl);
  } catch {
    throw new HTTPException(400, {
      message: "Paste the full My DU address after signing in.",
    });
  }
  const fragment = new URLSearchParams(url.hash.slice(1));
  if (
    url.origin !== MY_DU_ORIGIN ||
    url.pathname !== "/login" ||
    url.username ||
    url.password ||
    url.search ||
    fragment.get("state") !== state
  ) {
    throw new HTTPException(400, {
      message: "This link does not match your connection request. Start sign-in again.",
    });
  }
  const code = fragment.get("code");
  if (!code || code.length > 16_000) {
    throw new HTTPException(400, {
      message: "The link has no login code. Finish Microsoft sign-in and copy the final address.",
    });
  }
  return code;
}

export async function startLogin(env: Env, userId: string) {
  const state = crypto.randomUUID();
  const expiresAt = Date.now() + LOGIN_TTL;
  await saveLoginRequest(createDb(env.DB), userId, state, expiresAt);
  const url = new URL(
    "https://login.microsoftonline.com/158f15f3-83e0-4906-824c-69bdc50d9d61/oauth2/v2.0/authorize",
  );
  url.search = new URLSearchParams({
    client_id: "9f15860b-4243-4610-845e-428dc4ae43a8",
    response_type: "code",
    redirect_uri: `${MY_DU_ORIGIN}/login`,
    response_mode: "fragment",
    scope: "offline_access user.read mail.read",
    state,
  }).toString();
  return { url: url.href, expiresAt };
}

export async function completeLogin(env: Env, userId: string, input: unknown) {
  const result = connectMyDuSchema.safeParse(input);
  if (!result.success) {
    throw new HTTPException(400, {
      message: "Check the connection link, academic year, period, and Monday of teaching week 1.",
      cause: result.error,
    });
  }
  const { callbackUrl, ...settings } = result.data;
  const db = createDb(env.DB);
  const pending = await findLoginRequest(db, userId);
  if (!pending || pending.expiresAt < Date.now()) {
    throw new HTTPException(400, {
      message: "Your connection request expired. Start sign-in again.",
    });
  }
  const code = parseCallback(callbackUrl, pending.state);
  let credentials;
  try {
    credentials = await exchangeLoginCode(code);
  } catch (error) {
    throw new HTTPException(400, {
      message: "My DU rejected the login. Start sign-in again and paste the new link promptly.",
      cause: error,
    });
  }
  if (!(await consumeLoginRequest(db, userId, pending.state))) {
    throw new HTTPException(409, {
      message: "This connection request has already been used.",
    });
  }
  await replaceConnection(
    db,
    userId,
    await encryptCredentials(credentials, env.BETTER_AUTH_SECRET, userId),
    settings,
  );
  await syncSchedule(env, userId);
  return readSchedule(env, userId);
}

export async function readSchedule(env: Env, userId: string) {
  const row = await findConnection(createDb(env.DB), userId);
  return {
    connection: row
      ? {
          connected: !!row.credentials,
          studyYear: row.studyYear,
          term: row.term,
          firstWeekStart: row.firstWeekStart,
          lastSyncedAt: row.lastSyncedAt,
          syncError: row.syncError,
        }
      : null,
    events: row?.events ?? [],
  };
}

export async function syncSchedule(env: Env, userId: string) {
  const db = createDb(env.DB);
  const now = Date.now();
  const leaseUntil = now + SYNC_LEASE;
  const row = await acquireSyncLease(db, userId, now, leaseUntil);
  if (!row) return;
  try {
    if (!row.credentials) return;
    const credentials = await decryptCredentials(row.credentials, env.BETTER_AUTH_SECRET, userId);
    const get = createMyDuClient(
      credentials,
      async (rotated) => {
        await updateCredentials(
          db,
          userId,
          leaseUntil,
          await encryptCredentials(rotated, env.BETTER_AUTH_SECRET, userId),
        );
      },
      async () => {
        await updateCredentials(db, userId, leaseUntil, null);
      },
    );
    const setting = parseMyDuResponse(
      termLengthSchema,
      await get(
        `/admin/client/settings/${row.term === -1 ? "add_term_week_count" : "term_week_count"}`,
      ),
    );
    const events: ScheduleItem[] = [];
    for (let week = 1; week <= setting.value; week++) {
      const data = await get("/edu-process/classSchedule/student/me/search", {
        filters: [
          { id: "studyYear", value: String(row.studyYear) },
          { id: "term", value: String(row.term) },
          { id: "weekNumber", value: String(week) },
        ],
        start: 0,
        size: 100,
      });
      events.push(...normalizeWeek(data, row, week));
    }
    await saveSchedule(db, userId, leaseUntil, events, Date.now());
  } catch (error) {
    const message =
      error instanceof MyDuConnectionError
        ? "Could not reach My DU. Saved classes are unchanged. Try again later."
        : error instanceof Error
          ? error.message
          : "Could not update your My DU schedule.";
    await saveSyncError(db, userId, leaseUntil, message.slice(0, 250));
  } finally {
    await releaseSyncLease(db, userId, leaseUntil);
  }
}

export function disconnect(env: Env, userId: string) {
  return disconnectConnection(createDb(env.DB), userId);
}

export function syncDue(
  row: Pick<MyDuConnection, "credentials" | "lastAttemptAt">,
  now = Date.now(),
) {
  return !!row.credentials && (!row.lastAttemptAt || row.lastAttemptAt < now - SYNC_INTERVAL);
}
