import { BellIcon, SendIcon } from "lucide-react";
import { TimeGridView } from "@/components/event-calendar/time-grid-view";
import { Button } from "@/components/ui/button";
import { startOfWeek, today, weekDays } from "@/lib/calendar-dates";
import { eventKinds } from "@/lib/event-kinds";
import { demoWeek } from "./demo-week";
import { Dashes, Spiral } from "./doodles";
import { SignInDialog } from "./sign-in-dialog";

const paneCalendars = ["lecture", "online", "practice", "assignment", "quiz"] as const;

export function Hero({ next }: { next: string }) {
  const monday = startOfWeek(today());
  // Wednesday late morning: classes before it read as past, the rest of the week ahead.
  const demoNow = monday.add({ days: 2 }).toPlainDateTime("11:40");

  return (
    <section className="flex flex-col items-center gap-8 px-5 pt-20 text-center">
      <h1 className="type-display max-w-4xl">Your AITU week, in one place</h1>
      <p className="type-lead max-w-[620px] text-muted-foreground">
        Classes from My DU and deadlines from Moodle on one calm calendar, with reminders from the
        Telegram bot three hours before anything is due.
      </p>
      <div className="flex flex-col items-center gap-3">
        <SignInDialog next={next}>
          <Button size="xl">
            <SendIcon data-icon="inline-start" />
            Sign in with Telegram
          </Button>
        </SignInDialog>
        <p className="text-sm text-muted-foreground">
          Free for every AITU student. No passwords stored.
        </p>
      </div>
      <div className="relative mt-10 w-full max-w-[1000px]">
        <Spiral className="absolute -top-14 -left-16 hidden size-24 lg:block" />
        <Dashes className="absolute -top-10 -right-10 hidden size-16 lg:block" />
        <div className="flex h-[30rem] overflow-hidden rounded-t-[28px] bg-card text-left shadow-md ring-1 ring-foreground/10">
          <div
            aria-hidden
            className="hidden w-52 shrink-0 flex-col gap-1 bg-muted p-4 text-sm md:flex"
          >
            <span className="mb-3 type-wordmark text-base">remoodle</span>
            <span className="px-2 pb-1 text-xs text-muted-foreground">Calendars</span>
            {paneCalendars.map((kind) => (
              <span key={kind} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                <span className={`size-2 rounded-full ${eventKinds[kind].dot}`} />
                {eventKinds[kind].label}
              </span>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <TimeGridView days={weekDays(monday)} events={demoWeek(monday)} now={demoNow} />
          </div>
        </div>
        <ReminderPopover />
      </div>
    </section>
  );
}

// The one glow on the page: the reminder the bot is about to send.
function ReminderPopover() {
  return (
    <div className="absolute bottom-10 left-4 flex w-80 animate-[rise-in_900ms_var(--ease-out-soft)_both] gap-3 rounded-[14px] border-[1.5px] border-primary bg-card p-3.5 text-left shadow-[0_0_28px_color-mix(in_srgb,var(--primary)_22%,transparent)] [--tilt:-2deg] motion-reduce:animate-none md:-left-8">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <BellIcon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-col text-sm">
        <span className="font-semibold">Lab 4 is due in 3 hours</span>
        <span className="text-muted-foreground">Algorithms and data structures · 23:59</span>
        <span className="mt-1 text-xs text-muted-foreground">ReMoodle bot · now</span>
      </div>
    </div>
  );
}
