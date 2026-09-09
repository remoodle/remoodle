import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { createDb } from "./db";
import { moodleConnections } from "./db/schema";
import { encryptSecret, decryptSecret } from "./secrets";
import { fetchMoodleFeed, validateMoodleUrl } from "./moodle-feed";
import type { MoodleEvent } from "../shared/moodle";

// Only the credential is persisted. Both the page and the bot request live events.
export async function readMoodle(env: Env, userId: string) {
  const [row] = await createDb(env.DB)
    .select()
    .from(moodleConnections)
    .where(eq(moodleConnections.userId, userId));
  if (!row) return { connection: null, events: [] as MoodleEvent[], fetchedAt: null };
  try {
    const url = await decryptSecret(row.encryptedUrl, env.BETTER_AUTH_SECRET, "moodle:" + userId);
    const events = await fetchMoodleFeed(url);
    return { connection: { connected: true }, events, fetchedAt: Date.now() };
  } catch {
    // Never turn a failed fetch into an empty feed, or the bot would erase its cache.
    throw new HTTPException(502, {
      message: "Could not load Moodle events. Try again or replace your calendar URL in Settings.",
    });
  }
}

export async function connectMoodle(env: Env, userId: string, input: unknown) {
  let url: string;
  try {
    url = validateMoodleUrl(input);
  } catch {
    throw new HTTPException(400, { message: "Use the calendar export URL from AITU Moodle." });
  }
  let events;
  try {
    events = await fetchMoodleFeed(url);
  } catch {
    throw new HTTPException(400, {
      message: "Could not open this Moodle calendar. Generate a new calendar URL in Moodle.",
    });
  }
  const encryptedUrl = await encryptSecret(url, env.BETTER_AUTH_SECRET, "moodle:" + userId);
  await createDb(env.DB)
    .insert(moodleConnections)
    .values({ userId, encryptedUrl })
    .onConflictDoUpdate({ target: moodleConnections.userId, set: { encryptedUrl } });
  return { connection: { connected: true }, events, fetchedAt: Date.now() };
}

export async function disconnectMoodle(env: Env, userId: string) {
  await createDb(env.DB).delete(moodleConnections).where(eq(moodleConnections.userId, userId));
}
