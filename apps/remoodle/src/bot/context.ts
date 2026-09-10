import type { HydrateFlavor } from "@grammyjs/hydrate";
import type { Context as GrammyContext, SessionFlavor } from "grammy";
import type { ShortCache } from "../library/short-cache";

export type SessionData = {
  awaitingRemoodleToken?: boolean;
  awaitingMoodleCalendarUrl?: boolean;
  awaitingScheduleReminderMinutes?: boolean;
  awaitingDigestTime?: boolean;
};

export type Context = HydrateFlavor<
  GrammyContext & SessionFlavor<SessionData> & { shortCache: ShortCache }
>;
