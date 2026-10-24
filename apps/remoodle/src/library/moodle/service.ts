import * as usersRepository from "../../db/repositories/users";
import type { MoodleEvent } from "../../shared/moodle";
import { moodleToDeadlineEvents } from "./deadlines";
import { UserFacingError } from "../errors";
import { fetchMoodleFeed, validateMoodleUrl } from "./feed";

// Only the export URL is persisted; the web calendar and the bot read live events.
export async function readMoodle(moodleCalendarUrl: string | null) {
  if (!moodleCalendarUrl) {
    const events: MoodleEvent[] = [];

    return { connected: false, events, fetchedAt: null };
  }

  try {
    return {
      connected: true,
      events: await fetchMoodleFeed(moodleCalendarUrl),
      fetchedAt: Date.now(),
    };
  } catch (error) {
    // Never turn a failed fetch into an empty feed, or cached reminders would be erased.
    throw new UserFacingError(
      "Could not load Moodle events. Try again or send a new calendar URL to the bot.",
      { cause: error },
    );
  }
}

// The URL is saved only after its feed loads, so a typo never replaces a working connection.
export async function connectMoodle(userId: number, input: string) {
  let url: string;

  try {
    url = validateMoodleUrl(input);
  } catch (error) {
    throw new UserFacingError("Use the calendar export URL from AITU Moodle.", { cause: error });
  }

  try {
    await fetchMoodleFeed(url);
  } catch (error) {
    throw new UserFacingError(
      "Could not open this Moodle calendar. Generate a new calendar URL in Moodle.",
      { cause: error },
    );
  }

  await usersRepository.update(userId, { moodleCalendarUrl: url });
}

export async function disconnectMoodle(userId: number) {
  await usersRepository.update(userId, { moodleCalendarUrl: null });
}

export async function fetchDeadlineEvents(moodleCalendarUrl: string) {
  return moodleToDeadlineEvents(await fetchMoodleFeed(moodleCalendarUrl));
}
