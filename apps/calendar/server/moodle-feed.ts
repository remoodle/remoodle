import ICAL from "ical.js";
import { Temporal } from "temporal-polyfill";
import type { MoodleEvent } from "../shared/moodle";
import { CALENDAR_TIME_ZONE } from "../shared/ical";

export function validateMoodleUrl(input: unknown) {
  if (typeof input !== "string" || input.length > 4096)
    throw new Error("Paste a Moodle calendar URL.");
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error("Paste a valid Moodle calendar URL.");
  }
  if (
    url.origin !== "https://lms.astanait.edu.kz" ||
    url.pathname !== "/calendar/export_execute.php" ||
    url.username ||
    url.password ||
    url.hash ||
    !/^\d+$/.test(url.searchParams.get("userid") ?? "") ||
    !/^[a-zA-Z0-9]+$/.test(url.searchParams.get("authtoken") ?? "")
  ) {
    throw new Error("Use the calendar export URL from AITU Moodle.");
  }
  return url.href;
}

function localTime(time: ICAL.Time, tzid?: string) {
  if (time.isDate) return time.toString();
  if (time.zone.tzid === "UTC" || time.zone.tzid !== "floating") {
    return Temporal.Instant.fromEpochMilliseconds(time.toUnixTime() * 1000)
      .toZonedDateTimeISO(CALENDAR_TIME_ZONE)
      .toPlainDateTime()
      .toString();
  }
  return Temporal.PlainDateTime.from(time.toString())
    .toZonedDateTime(tzid || CALENDAR_TIME_ZONE)
    .withTimeZone(CALENDAR_TIME_ZONE)
    .toPlainDateTime()
    .toString();
}

export function parseMoodleFeed(text: string): MoodleEvent[] {
  if (!text.trimStart().startsWith("BEGIN:VCALENDAR") || !text.trimEnd().endsWith("END:VCALENDAR"))
    throw new Error("Moodle did not return a calendar. Generate a new export URL.");
  const calendar = new ICAL.Component(ICAL.parse(text));
  const components = calendar.getAllSubcomponents("vevent");
  if (components.length > 5000) throw new Error("This Moodle calendar contains too many events.");
  const result = new Map<string, MoodleEvent>();
  for (const component of components) {
    if (component.getFirstPropertyValue("status") === "CANCELLED") continue;
    const event = new ICAL.Event(component);
    // Moodle exports individual occurrences. Reject unsupported feeds rather than
    // silently importing just the first occurrence of a recurring event.
    if (event.isRecurring() || event.isRecurrenceException())
      throw new Error("Recurring calendar entries are not supported by this Moodle connection.");
    if (!event.uid || !event.summary || !event.startDate)
      throw new Error("Moodle returned an incomplete event.");
    const start = localTime(
      event.startDate,
      component.getFirstProperty("dtstart")?.getParameter("tzid") as string | undefined,
    );
    const end = localTime(
      event.endDate,
      component.getFirstProperty("dtend")?.getParameter("tzid") as string | undefined,
    );
    if (end < start) throw new Error("Moodle returned an invalid event duration.");
    const categories = component.getFirstPropertyValue("categories");
    const title = event.summary.trim();
    const kind = /^attendance\b/i.test(title)
      ? "attendance"
      : /\bassignment\b|\bis due\b/i.test(title)
        ? "assignment"
        : "other";
    // Preserve source identity for bot reminder history. The display adapter
    // encodes this ID for Schedule-X's CSS selectors.
    const id = "moodle-" + event.uid;
    result.set(id, {
      id,
      title,
      kind,
      start,
      end,
      allDay: event.startDate.isDate,
      description: event.description || "",
      courseName: typeof categories === "string" ? categories.split("|")[0]!.trim() : "",
    });
  }
  return [...result.values()];
}

export async function fetchMoodleFeed(url: string) {
  const response = await fetch(validateMoodleUrl(url), {
    redirect: "manual",
    headers: { Accept: "text/calendar" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok || response.status >= 300)
    throw new Error("Could not fetch the Moodle calendar. Check your export URL.");
  if (!response.body) throw new Error("Moodle returned an empty response.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 1_500_000)
        throw new Error("The Moodle calendar is too large. Choose a shorter export period.");
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    await reader.cancel();
  }
  return parseMoodleFeed(text);
}
