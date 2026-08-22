import type { Context } from "./context";
import { fetchGroupSchedule } from "../library/calendar-api";

export async function fetchCachedGroupSchedule(ctx: Context, group: string) {
  return ctx.shortCache.getOrPut(`schedule:${group}`, async () => fetchGroupSchedule(group));
}
