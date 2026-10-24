import { z } from "zod";
import { database } from "../../db";
import type { ScheduleItem } from "../../library/schedule/items";
import { config } from "../../config";
import { decryptSecret, encryptSecret } from "../crypto";
import { UserFacingError } from "../errors";
import { logger } from "../logger";
import { createMyDuClient, exchangeLoginCode, MY_DU_ORIGIN, MyDuConnectionError } from "./client";
import { normalizeWeek } from "./schedule";
import {
  credentialsSchema,
  parseMyDuResponse,
  studyYearOf,
  termLengthSchema,
  type MyDuCredentials,
  type MyDuPeriod,
} from "./schemas";

const LOGIN_TTL = 10 * 60_000;

const SYNC_LEASE = 12 * 60_000;

// Background refresh cadence; the Hatchet `my-du-sync` cron picks connections older than this.
export const SYNC_INTERVAL = 24 * 60 * 60_000;

// Manual syncs are throttled so a double click does not hit My DU twice.
const MANUAL_SYNC_COOLDOWN = 60_000;

const log = logger.child().withContext({ module: "my-du" });

function credentialsContext(userId: number) {
  return { key: config.api.encryptionKey, purpose: "my-du-credentials", owner: String(userId) };
}

function encryptCredentials(value: MyDuCredentials, userId: number) {
  return encryptSecret(JSON.stringify(value), credentialsContext(userId));
}

function decryptCredentials(value: string, userId: number) {
  return parseMyDuResponse(
    credentialsSchema,
    JSON.parse(decryptSecret(value, credentialsContext(userId))),
  );
}

function parseCallback(callbackUrl: string, state: string) {
  let url: URL;

  try {
    url = new URL(callbackUrl);
  } catch {
    throw new UserFacingError("Paste the full My DU address after signing in.");
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
    throw new UserFacingError(
      "This link does not match your connection request. Start sign-in again.",
    );
  }

  const code = fragment.get("code");

  if (!code || code.length > 16_000) {
    throw new UserFacingError(
      "The link has no login code. Finish Microsoft sign-in and copy the final address.",
    );
  }

  return code;
}

function toSettings({ term, firstWeekStart }: MyDuPeriod) {
  return { studyYear: studyYearOf(firstWeekStart), term, firstWeekStart };
}

// My DU only accepts its own Microsoft app registration, so the user signs in there and
// sends the final redirect address back to the bot.
export async function startLogin(userId: number) {
  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + LOGIN_TTL);
  await database.myDu.saveLoginRequest(userId, state, expiresAt);

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

  return { url: url.href, expiresAt: expiresAt.getTime() };
}

export async function completeLogin(userId: number, callbackUrl: string, period: MyDuPeriod) {
  const pending = await database.myDu.findLoginRequest(userId);

  if (!pending || pending.expiresAt < new Date()) {
    throw new UserFacingError("Your connection request expired. Start sign-in again.");
  }

  const code = parseCallback(callbackUrl, pending.state);
  let credentials: MyDuCredentials;

  try {
    credentials = await exchangeLoginCode(code);
  } catch (error) {
    log
      .withError(error instanceof Error ? error : new Error(String(error)))
      .withMetadata({ userId, cause: error instanceof Error ? error.cause : undefined })
      .warn("my du login exchange failed");

    // An unreachable My DU never saw the code, so the same link still works.
    throw new UserFacingError(
      error instanceof MyDuConnectionError
        ? "Could not reach My DU. Send the same link again in a minute."
        : "My DU did not accept this link. Each link works once and expires within minutes, so start sign-in again.",
      { cause: error },
    );
  }

  if (!(await database.myDu.consumeLoginRequest(userId, pending.state))) {
    throw new UserFacingError("This connection request has already been used.");
  }

  await database.myDu.replaceConnection(
    userId,
    encryptCredentials(credentials, userId),
    toSettings(period),
  );
  await syncSchedule(userId);

  return readSchedule(userId);
}

// Switching periods keeps the credentials; classes from the previous period are dropped.
export async function changePeriod(userId: number, period: MyDuPeriod) {
  const row = await database.myDu.findConnection(userId);

  // Without a working login the old classes would be cleared with nothing to replace them.
  if (!row?.credentials) throw new UserFacingError("Reconnect My DU to change the period.");

  await database.myDu.updateSettings(userId, toSettings(period));
  await syncSchedule(userId);

  return readSchedule(userId);
}

export async function readSchedule(userId: number) {
  const row = await database.myDu.findConnection(userId);

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

export async function requestSync(userId: number) {
  const row = await database.myDu.findConnection(userId);

  if (!row?.credentials) throw new UserFacingError("Connect My DU first.");

  if (!row.lastAttemptAt || row.lastAttemptAt.getTime() < Date.now() - MANUAL_SYNC_COOLDOWN) {
    await syncSchedule(userId);
  }

  return readSchedule(userId);
}

export async function syncSchedule(userId: number) {
  const now = Date.now();
  const leaseUntil = now + SYNC_LEASE;
  const row = await database.myDu.acquireSyncLease(userId, now, leaseUntil);

  if (!row?.credentials) {
    if (row) await database.myDu.releaseSyncLease(userId, leaseUntil);

    return;
  }

  try {
    const get = createMyDuClient(
      decryptCredentials(row.credentials, userId),
      (rotated) =>
        database.myDu.updateCredentials(userId, leaseUntil, encryptCredentials(rotated, userId)),
      () => database.myDu.updateCredentials(userId, leaseUntil, null),
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

    await database.myDu.saveSchedule(userId, leaseUntil, events);
    log.withMetadata({ userId, eventCount: events.length }).info("my du sync complete");
  } catch (error) {
    log
      .withError(error instanceof Error ? error : new Error(String(error)))
      .withMetadata({
        userId,
        issues:
          error instanceof Error && error.cause instanceof z.ZodError
            ? error.cause.issues
            : undefined,
      })
      .error("my du sync failed");

    const message =
      error instanceof MyDuConnectionError
        ? "Could not reach My DU. Saved classes are unchanged. Try again later."
        : error instanceof Error
          ? error.message
          : "Could not update your My DU schedule.";

    await database.myDu.saveSyncError(userId, leaseUntil, message.slice(0, 250));
  } finally {
    await database.myDu.releaseSyncLease(userId, leaseUntil);
  }
}

export function disconnect(userId: number) {
  return database.myDu.disconnect(userId);
}
