import type { ReactNode } from "react";
import { cn } from "cn";
import { eventKinds } from "@/lib/event-kinds";

/** A grained mist card with a white mini-UI cropped at its bottom edge. */
function MistCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="grain flex h-[30rem] flex-col gap-3 rounded-[28px] bg-muted px-8 pt-8 text-left">
      <span className="text-sm text-muted-foreground">{eyebrow}</span>
      <h3 className="type-title max-w-64">{title}</h3>
      <div
        aria-hidden
        className="mt-auto flex flex-col gap-2 rounded-t-3xl bg-card p-4 pb-10 shadow-md ring-1 ring-foreground/10"
      >
        {children}
      </div>
    </article>
  );
}

function MiniEvent({
  kind,
  title,
  meta,
}: {
  kind: keyof typeof eventKinds;
  title: string;
  meta: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 rounded-md px-3 py-2 text-[13px]",
        eventKinds[kind].fill,
      )}
    >
      <span className="font-semibold">{title}</span>
      <span className="tabular-nums opacity-75">{meta}</span>
    </div>
  );
}

export function FeatureCards() {
  return (
    <section id="features" className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-5">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="type-headline max-w-2xl">
          Everything your week needs, nothing it doesn&apos;t
        </h2>
        <p className="type-lead max-w-[620px] text-muted-foreground">
          Two sources you already use, one calendar you actually open, and a nudge before anything
          is due.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        <MistCard eyebrow="From My DU" title="Every class on the right day">
          <MiniEvent kind="lecture" title="Computer networks" meta="09:00 – 10:50 · Main hall" />
          <MiniEvent kind="practice" title="English for IT" meta="12:00 – 12:50 · C1.3.255" />
          <MiniEvent kind="online" title="Databases" meta="14:00 – 15:50 · Online" />
        </MistCard>
        <MistCard eyebrow="From Moodle" title="Deadlines next to the classes they belong to">
          <MiniEvent kind="assignment" title="Lab 4 is due" meta="Thu · 23:59" />
          <MiniEvent kind="quiz" title="Quiz 3 closes" meta="Tue · 18:00" />
          <MiniEvent kind="assignment" title="Essay draft is due" meta="Fri · 12:00" />
        </MistCard>
        <MistCard
          eyebrow="In Telegram and beyond"
          title="Reminders, plus a feed for any calendar app"
        >
          <div className="self-start rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-[13px]">
            <span className="font-semibold">Lab 4 is due in 3 hours.</span> Algorithms and data
            structures, 23:59.
          </div>
          <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-[13px] ring-1 ring-border">
            <span className="truncate text-muted-foreground">api.remoodle.app/api/ical/…</span>
            <span className="font-semibold text-primary">Copy</span>
          </div>
        </MistCard>
      </div>
    </section>
  );
}
