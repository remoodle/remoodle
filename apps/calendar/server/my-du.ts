import { and, eq, lt } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { Temporal } from "temporal-polyfill";
import type { ScheduleItem } from "../shared/schedule";
import { createDb } from "./db";
import { myDuConnections, myDuLoginRequests } from "./db/schema";

const ORIGIN = "https://my-du.astanait.edu.kz";
const LOGIN_TTL = 10 * 60_000;
export const SYNC_INTERVAL = 60 * 60_000;
type Credentials = { access_token: string; refresh_token: string };
type Connection = typeof myDuConnections.$inferSelect;

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Unexpected My DU response.");
  return value as Record<string, unknown>;
}
function str(value: unknown): string {
  if (typeof value !== "string") throw new Error("Unexpected My DU response.");
  return value;
}
function num(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value))
    throw new Error("Unexpected My DU response.");
  return value;
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error("Unexpected My DU response.");
  return value;
}
function tokens(value: unknown): Credentials {
  const data = record(value);
  const access_token = str(data.access_token);
  const refresh_token = str(data.refresh_token);
  if (!access_token || !refresh_token || /[\r\n;]/.test(access_token + refresh_token))
    throw new Error("Invalid My DU credentials.");
  return { access_token, refresh_token };
}

// Tokens are encrypted at rest, bound to their calendar owner, and never returned to the UI.
async function key(secret: string) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("my-du-v1"),
      info: new TextEncoder().encode("credentials"),
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
export async function encryptCredentials(value: Credentials, secret: string, userId: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(userId) },
    await key(secret),
    new TextEncoder().encode(JSON.stringify(value)),
  );
  const encrypted = new Uint8Array(data);
  const payload = new Uint8Array(iv.length + encrypted.length);
  payload.set(iv);
  payload.set(encrypted, iv.length);
  let encoded = "";
  for (let index = 0; index < payload.length; index++) {
    encoded += String.fromCharCode(payload[index]!);
  }
  return btoa(encoded);
}
export async function decryptCredentials(value: string, secret: string, userId: string) {
  const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
  const data = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytes.slice(0, 12), additionalData: new TextEncoder().encode(userId) },
    await key(secret),
    bytes.slice(12),
  );
  return tokens(JSON.parse(new TextDecoder().decode(data)));
}

export function parseCallback(callbackUrl: string, state: string) {
  let url: URL;
  try {
    url = new URL(callbackUrl);
  } catch {
    throw new HTTPException(400, { message: "Paste the full My DU address after signing in." });
  }
  const fragment = new URLSearchParams(url.hash.slice(1));
  if (
    url.origin !== ORIGIN ||
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
  if (!code || code.length > 16_000)
    throw new HTTPException(400, {
      message: "The link has no login code. Finish Microsoft sign-in and copy the final address.",
    });
  return code;
}

export function parseSettings(value: unknown) {
  const data = record(value);
  const studyYear = Number(data.studyYear);
  const term = Number(data.term);
  const firstWeekStart = typeof data.firstWeekStart === "string" ? data.firstWeekStart : "";
  let monday: Temporal.PlainDate;
  try {
    monday = Temporal.PlainDate.from(firstWeekStart);
  } catch {
    throw new HTTPException(400, { message: "Enter the Monday of teaching week 1." });
  }
  if (
    !Number.isInteger(studyYear) ||
    studyYear < 2020 ||
    studyYear > 2100 ||
    ![-1, 1, 2, 3].includes(term) ||
    monday.dayOfWeek !== 1 ||
    monday.year < studyYear ||
    monday.year > studyYear + 1 ||
    monday.toString() !== firstWeekStart
  ) {
    throw new HTTPException(400, {
      message: "Check the academic year, period, and Monday of teaching week 1.",
    });
  }
  return { studyYear, term, firstWeekStart };
}

export async function startLogin(env: Env, userId: string) {
  const db = createDb(env.DB);
  const state = crypto.randomUUID();
  const expiresAt = Date.now() + LOGIN_TTL;
  await db
    .insert(myDuLoginRequests)
    .values({ userId, state, expiresAt })
    .onConflictDoUpdate({ target: myDuLoginRequests.userId, set: { state, expiresAt } });
  const url = new URL(
    "https://login.microsoftonline.com/158f15f3-83e0-4906-824c-69bdc50d9d61/oauth2/v2.0/authorize",
  );
  url.search = new URLSearchParams({
    client_id: "9f15860b-4243-4610-845e-428dc4ae43a8",
    response_type: "code",
    redirect_uri: `${ORIGIN}/login`,
    response_mode: "fragment",
    scope: "offline_access user.read mail.read",
    state,
  }).toString();
  return { url: url.href, expiresAt };
}

async function request(path: string, credentials?: Credentials, body?: unknown) {
  const headers = new Headers({ Accept: "application/json" });
  if (body !== undefined) headers.set("Content-Type", "application/json");
  if (credentials)
    headers.set(
      "Cookie",
      `access_token=${credentials.access_token}; refresh_token=${credentials.refresh_token}`,
    );
  const response = await fetch(`${ORIGIN}/api${path}${path.includes("?") ? "&" : "?"}lang=en`, {
    method: body === undefined ? "GET" : "POST",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    // Workers only implements follow/manual. Never follow an API response onto
    // another host because the request carries the user's My DU cookies.
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
  });

  if (response.status >= 300 && response.status < 400) {
    throw new Error("My DU returned an unexpected redirect.");
  }

  return response;
}

export async function completeLogin(env: Env, userId: string, value: unknown) {
  const data = record(value);
  const settings = parseSettings(data);
  if (typeof data.callbackUrl !== "string" || data.callbackUrl.length > 20_000)
    throw new HTTPException(400, { message: "Paste your My DU connection link." });
  const db = createDb(env.DB);
  const [pending] = await db
    .select()
    .from(myDuLoginRequests)
    .where(eq(myDuLoginRequests.userId, userId));
  if (!pending || pending.expiresAt < Date.now())
    throw new HTTPException(400, {
      message: "Your connection request expired. Start sign-in again.",
    });
  const code = parseCallback(data.callbackUrl.trim(), pending.state);
  const response = await request("/auth/external-login", undefined, {
    provider: "microsoft",
    token: code,
    email: null,
    device_info: { platform: "ios", device_id: null },
    avatar_url: null,
    first_name: null,
    last_name: null,
  });
  if (!response.ok)
    throw new HTTPException(400, {
      message: "My DU rejected the login. Start sign-in again and paste the new link promptly.",
    });
  const consumed = await db
    .delete(myDuLoginRequests)
    .where(and(eq(myDuLoginRequests.userId, userId), eq(myDuLoginRequests.state, pending.state)))
    .returning();
  if (!consumed.length)
    throw new HTTPException(409, { message: "This connection request has already been used." });
  const credentials = await encryptCredentials(
    tokens(await response.json()),
    env.BETTER_AUTH_SECRET,
    userId,
  );
  // Replacing an account clears its old imported data instead of mixing two students' schedules.
  await db
    .insert(myDuConnections)
    .values({ userId, credentials, ...settings })
    .onConflictDoUpdate({
      target: myDuConnections.userId,
      set: {
        credentials,
        ...settings,
        events: [],
        lastSyncedAt: null,
        lastAttemptAt: null,
        syncError: null,
        lockUntil: 0,
      },
    });
  await syncSchedule(env, userId);
  return readSchedule(env, userId);
}

export function normalizeWeek(
  value: unknown,
  settings: { studyYear: number; term: number; firstWeekStart: string },
  week: number,
): ScheduleItem[] {
  const data = record(value);
  if (
    num(data.studyYear) !== settings.studyYear ||
    num(data.term) !== settings.term ||
    num(data.weekNumber) !== week
  )
    throw new Error("My DU returned a different academic week.");
  const monday = Temporal.PlainDate.from(settings.firstWeekStart).add({ weeks: week - 1 });
  return list(data.slots).flatMap((slot) => {
    const group = record(slot);
    const day = num(record(group.weekDay).id);
    if (day < 1 || day > 7) throw new Error("Unexpected My DU weekday.");
    const date = monday.add({ days: day - 1 }).toString();
    return list(group.items).map((raw): ScheduleItem => {
      const item = record(raw);
      const time = record(item.classTime);
      const match = str(time.title).match(/^(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})$/);
      if (!match) throw new Error("Unexpected My DU lesson time.");
      const start = Temporal.PlainTime.from(match[1]!.padStart(5, "0")).toString({
        smallestUnit: "minute",
      });
      const end = Temporal.PlainTime.from(match[2]!.padStart(5, "0")).toString({
        smallestUnit: "minute",
      });
      if (end <= start) throw new Error("Unexpected My DU lesson duration.");
      const lessonType = str(item.lessonType);
      if (typeof item.online !== "boolean") throw new Error("Unexpected My DU lesson format.");
      return {
        id: `mydu-${settings.studyYear}-${settings.term}-${week}-${num(item.uid)}-${num(time.id)}`,
        start: `${date} ${start}`,
        end: `${date} ${end}`,
        courseName: str(item.subjectName),
        location: item.online
          ? "Online"
          : [item.classroom, item.building]
              .filter((v): v is string => typeof v === "string" && !!v)
              .join(" · "),
        isOnline: item.online,
        teacher:
          typeof item.replacementTeacherName === "string" && item.replacementTeacherName
            ? item.replacementTeacherName
            : str(item.teacherName ?? ""),
        type: /lecture/i.test(lessonType)
          ? "lecture"
          : /practic/i.test(lessonType)
            ? "practice"
            : null,
        lessonType,
      };
    });
  });
}

export async function readSchedule(env: Env, userId: string) {
  const [row] = await createDb(env.DB)
    .select()
    .from(myDuConnections)
    .where(eq(myDuConnections.userId, userId));
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
  const [row] = await db
    .update(myDuConnections)
    .set({ lockUntil: now + 5 * 60_000, lastAttemptAt: now })
    .where(and(eq(myDuConnections.userId, userId), lt(myDuConnections.lockUntil, now)))
    .returning();
  if (!row) return;
  // The lease also prevents an old in-flight sync from overwriting a reconnection.
  const owned = and(
    eq(myDuConnections.userId, userId),
    eq(myDuConnections.lockUntil, now + 5 * 60_000),
  );
  try {
    if (!row.credentials) return;
    let credentials = await decryptCredentials(row.credentials, env.BETTER_AUTH_SECRET, userId);
    const get = async (path: string, body?: unknown) => {
      let response = await request(path, credentials, body);
      if (response.status === 401) {
        const refreshed = await request("/auth/refresh", credentials, {});
        if ([401, 403].includes(refreshed.status)) {
          await db.update(myDuConnections).set({ credentials: null }).where(owned);
          throw new Error("Reconnect My DU to update your saved classes.");
        }
        if (!refreshed.ok)
          throw new Error("My DU could not refresh your session. Try syncing again later.");
        credentials = tokens(await refreshed.json());
        // Persist rotated tokens before another request can fail.
        await db
          .update(myDuConnections)
          .set({
            credentials: await encryptCredentials(credentials, env.BETTER_AUTH_SECRET, userId),
          })
          .where(owned);
        response = await request(path, credentials, body);
      }
      if (!response.ok)
        throw new Error(
          `My DU schedule request failed (${response.status}). Saved classes are unchanged.`,
        );
      return response.json();
    };
    const setting = record(
      await get(
        `/admin/client/settings/${row.term === -1 ? "add_term_week_count" : "term_week_count"}`,
      ),
    );
    const count = Number(setting.value);
    if (!Number.isInteger(count) || count < 1 || count > 30)
      throw new Error("Unexpected My DU term length.");
    const events: ScheduleItem[] = [];
    for (let week = 1; week <= count; week++) {
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
    await db
      .update(myDuConnections)
      .set({ events, lastSyncedAt: Date.now(), syncError: null })
      .where(owned);
  } catch (error) {
    const message =
      error instanceof Error && !error.message.includes("fetch")
        ? error.message
        : "Could not reach My DU. Saved classes are unchanged. Try again later.";
    await db
      .update(myDuConnections)
      .set({ syncError: message.slice(0, 250) })
      .where(owned);
  } finally {
    await db.update(myDuConnections).set({ lockUntil: 0 }).where(owned);
  }
}

export async function disconnect(env: Env, userId: string) {
  const db = createDb(env.DB);
  await db.batch([
    db
      .update(myDuConnections)
      .set({ credentials: null, syncError: null, lockUntil: 0 })
      .where(eq(myDuConnections.userId, userId)),
    db.delete(myDuLoginRequests).where(eq(myDuLoginRequests.userId, userId)),
  ]);
}

export function syncDue(row: Pick<Connection, "credentials" | "lastAttemptAt">) {
  return (
    !!row.credentials && (!row.lastAttemptAt || row.lastAttemptAt < Date.now() - SYNC_INTERVAL)
  );
}
