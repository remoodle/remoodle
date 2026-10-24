import type { Temporal } from "temporal-polyfill";
import { cn } from "cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNow } from "@/hooks/use-now";
import { eventsOn, formatDay, monthWeeks, weekDays } from "@/lib/calendar-dates";
import type { CalendarEvent } from "@/lib/calendar-events";
import { EventItem } from "./event-item";

// A month cell shows this many entries before collapsing the rest into "+n more".
const VISIBLE_PER_DAY = 3;

export function MonthView({ date, events }: { date: Temporal.PlainDate; events: CalendarEvent[] }) {
  const today = useNow().toPlainDate();
  const weeks = monthWeeks(date);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-7 border-b">
        {weekDays(date).map((day) => (
          <div key={day.dayOfWeek} className="py-2 text-center text-sm text-muted-foreground">
            {formatDay(day, { weekday: "short" })}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-fr overflow-y-auto">
        {weeks.map((week) => (
          <div
            key={week[0]!.toString()}
            className="grid min-h-28 grid-cols-7 border-b last:border-b-0"
          >
            {week.map((day) => {
              const dayEvents = eventsOn(events, day);
              const hidden = dayEvents.length - VISIBLE_PER_DAY;

              return (
                <div
                  key={day.toString()}
                  data-outside={day.month !== date.month || undefined}
                  className="flex min-w-0 flex-col gap-1 border-l p-1 first:border-l-0 data-outside:bg-muted/40"
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center self-start rounded-full text-sm tabular-nums",
                      day.equals(today) && "bg-primary font-semibold text-primary-foreground",
                      day.month !== date.month && !day.equals(today) && "text-muted-foreground",
                    )}
                  >
                    {day.day}
                  </span>
                  {dayEvents
                    .slice(0, hidden > 0 ? VISIBLE_PER_DAY - 1 : VISIBLE_PER_DAY)
                    .map((event) => (
                      <EventItem key={event.id} event={event} variant="row" />
                    ))}
                  {hidden > 0 && (
                    <Popover>
                      <PopoverTrigger className="h-6 rounded-md px-2 text-left text-xs text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
                        +{hidden + 1} more
                      </PopoverTrigger>
                      <PopoverContent className="w-64 gap-2">
                        <p className="font-semibold">
                          {formatDay(day, { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                        <div className="flex flex-col gap-1">
                          {dayEvents.map((event) => (
                            <EventItem key={event.id} event={event} variant="row" />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
