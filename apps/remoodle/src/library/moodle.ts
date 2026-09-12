import { fetchMoodleUrlEvents, fetchUserMoodleEvents } from "./calendar-api";

export type MoodleSource = {
  calendarUserId: string | null;
  moodleCalendarUrl: string | null;
};

export function hasMoodleSource(source: MoodleSource) {
  return Boolean(source.calendarUserId || source.moodleCalendarUrl);
}

export function fetchMoodleEvents(source: MoodleSource) {
  if (source.moodleCalendarUrl) {
    return fetchMoodleUrlEvents(source.moodleCalendarUrl);
  }

  if (source.calendarUserId) {
    return fetchUserMoodleEvents(source.calendarUserId);
  }

  throw new Error("Moodle calendar URL is not configured.");
}
