import { z } from "zod";
import { defaultMoodleFilters } from "@remoodle/shared/moodle";
import { defaultFilters, scheduleFilterSchema } from "@remoodle/shared/schedule";

export const FILTERS_STORAGE_KEY = "remoodle-filters";

// What the browser remembers: the subscription's filters plus which Moodle kinds to show.
const storedFiltersSchema = scheduleFilterSchema.extend({
  moodle: z
    .object({ attendance: z.boolean(), assignment: z.boolean(), other: z.boolean() })
    .default(defaultMoodleFilters),
});

export type StoredFilters = z.infer<typeof storedFiltersSchema>;

/** Unknown or outdated stored values fall back to the defaults instead of breaking the page. */
export function parseStoredFilters(raw: string | null): StoredFilters {
  try {
    const parsed = storedFiltersSchema.safeParse(JSON.parse(raw ?? "null"));

    if (parsed.success) return parsed.data;
  } catch {
    // Not JSON: use the defaults below.
  }

  return { ...defaultFilters(), moodle: defaultMoodleFilters() };
}
