import type { Temporal } from "temporal-polyfill";
import { CalendarX2Icon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useNow } from "@/hooks/use-now";
import { eventsOn, formatDay } from "@/lib/calendar-dates";
import type { CalendarEvent } from "@/lib/calendar-events";
import { EventItem } from "./event-item";

export const AGENDA_DAYS = 14;

export function AgendaView({
  date,
  events,
}: {
  date: Temporal.PlainDate;
  events: CalendarEvent[];
}) {
  const today = useNow().toPlainDate();

  const days = Array.from({ length: AGENDA_DAYS }, (_, index) => date.add({ days: index }))
    .map((day) => ({ day, events: eventsOn(events, day) }))
    .filter((entry) => entry.events.length > 0);

  if (days.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarX2Icon />
          </EmptyMedia>
          <EmptyTitle>Nothing in the next two weeks</EmptyTitle>
          <EmptyDescription>
            Check your filters in the sidebar, or move to another period.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-6">
        {days.map(({ day, events: dayEvents }) => (
          <section key={day.toString()} className="grid gap-3 sm:grid-cols-[9rem_1fr]">
            <h3 className="text-sm">
              <span className={day.equals(today) ? "font-semibold text-primary" : "font-semibold"}>
                {day.equals(today) ? "Today" : formatDay(day, { weekday: "long" })}
              </span>
              <span className="block text-muted-foreground">
                {formatDay(day, { day: "numeric", month: "long" })}
              </span>
            </h3>
            <div className="flex flex-col gap-2">
              {dayEvents.map((event) => (
                <EventItem key={event.id} event={event} variant="card" />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
