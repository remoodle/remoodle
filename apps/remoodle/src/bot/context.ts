import type { HydrateFlavor } from "@grammyjs/hydrate";
import type { Context as GrammyContext, SessionFlavor } from "grammy";
import type { MyDuPeriod, MyDuTerm } from "../library/my-du/schemas";

export type SessionData = {
  awaitingMoodleCalendarUrl?: boolean;
  awaitingScheduleReminderMinutes?: boolean;
  awaitingDigestTime?: boolean;
  // My DU setup asks for the period first: the sign-in code in the pasted link expires within minutes.
  myDuSetup?: { step: "week_start"; term: MyDuTerm } | { step: "link"; period: MyDuPeriod };
};

export type Context = HydrateFlavor<GrammyContext & SessionFlavor<SessionData>>;
