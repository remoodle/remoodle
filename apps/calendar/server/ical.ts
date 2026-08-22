import type { GroupScheduleItem } from "./types.d";
import { generateScheduleIcal, mergeAdjacentScheduleItems } from "../shared/ical";

export function generateIcal(
  items: GroupScheduleItem[],
  now: Date = new Date(),
  options?: {
    combineAdjacentPairs?: boolean;
    rangeStart?: Date;
    rangeEnd?: Date;
  },
): string {
  const sourceItems = options?.combineAdjacentPairs ? mergeAdjacentScheduleItems(items) : items;

  return generateScheduleIcal(sourceItems, now, {
    eventTimeFormat: "local",
    rangeStart: options?.rangeStart,
    rangeEnd: options?.rangeEnd,
  });
}
