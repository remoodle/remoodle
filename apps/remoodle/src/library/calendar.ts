export type CalendarEvent = {
  uid: string;
  summary: string;
  timestampMs: number;
  courseName?: string;
  description?: string;
};

export function shouldIgnoreCalendarEvent(event: Pick<CalendarEvent, "summary">): boolean {
  return /^attendance\b/i.test(event.summary.trim());
}

function parseTextValue(line: string): string {
  return line
    .replace(/^[^:]+:/, "")
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function parseCourseName(categories: string): string | undefined {
  const courseName = categories.split("|", 1)[0]?.trim().replace(/\s+/g, " ");
  return courseName || undefined;
}

function unfold(ics: string): string {
  return ics.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function parseDtstart(value: string): number | null {
  // Strip TZID param if present: DTSTART;TZID=... or DTSTART;VALUE=DATE
  const raw = value.replace(/^[^:]+:/, "");

  // DATE-TIME: 20240415T120000Z or 20240415T120000
  const dtMatch = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
  if (dtMatch) {
    const [, y, mo, d, h, mi, s, z] = dtMatch;
    const iso = `${y}-${mo}-${d}T${h}:${mi}:${s}${z ? "Z" : ""}`;
    const ms = Date.parse(iso);
    return Number.isNaN(ms) ? null : ms;
  }

  // DATE: 20240415
  const dateMatch = raw.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateMatch) {
    const [, y, mo, d] = dateMatch;
    const ms = Date.parse(`${y}-${mo}-${d}T00:00:00Z`);
    return Number.isNaN(ms) ? null : ms;
  }

  return null;
}

export async function fetchCalendarEvents(url: string): Promise<CalendarEvent[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch calendar: ${res.status}`);
  }

  const text = await res.text();
  return parseIcs(text);
}

export function parseIcs(ics: string): CalendarEvent[] {
  const unfolded = unfold(ics);
  const events: CalendarEvent[] = [];

  const veventBlocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];

  for (const block of veventBlocks) {
    const lines = block.split(/\r?\n/);

    let uid: string | undefined;
    let summary: string | undefined;
    let courseName: string | undefined;
    let description: string | undefined;
    let timestampMs: number | null = null;

    for (const line of lines) {
      if (line.startsWith("UID:")) {
        uid = line.slice(4).trim();
      } else if (line.startsWith("SUMMARY:")) {
        summary = parseTextValue(line);
      } else if (line.startsWith("CATEGORIES:")) {
        courseName = parseCourseName(parseTextValue(line));
      } else if (line.startsWith("DESCRIPTION:")) {
        description = parseTextValue(line) || undefined;
      } else if (line.startsWith("DTSTART")) {
        timestampMs = parseDtstart(line);
      }
    }

    if (uid && summary && timestampMs !== null) {
      const event = { uid, summary, timestampMs, courseName, description };

      if (!shouldIgnoreCalendarEvent(event)) {
        events.push(event);
      }
    }
  }

  return events;
}
