import type { Context } from "./context";
import { fetchUserSchedule } from "../library/calendar-api";

export async function fetchCachedUserSchedule(ctx: Context, userId: string) {
  return ctx.shortCache.getOrPut(`schedule:${userId}`, async () => fetchUserSchedule(userId));
}
