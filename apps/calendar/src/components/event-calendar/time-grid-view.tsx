import type { Temporal } from "temporal-polyfill";
import { cn } from "cn";
import { useEffect, useRef } from "react";
import { useNow } from "@/hooks/use-now";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  eventsOn,
  formatDay,
  gridMinutes,
  layoutDay,
} from "@/lib/calendar-dates";
import type { CalendarEvent } from "@/lib/calendar-events";
import { EventItem } from "./event-item";

// 64px per hour, from DESIGN.md.
const PX_PER_MINUTE = 64 / 60;

const hours = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, index) => DAY_START_HOUR + index,
);

/**
 * The week and day views: a date row for all-day entries and deadlines above an hour grid.
 * `now` pins the clock, so a demo renders identically on the server and in the browser.
 */
export function TimeGridView({
  days,
  events,
  now: pinnedNow,
}: {
  days: Temporal.PlainDate[];
  events: CalendarEvent[];
  now?: Temporal.PlainDateTime;
}) {
  const liveNow = useNow();
  const now = pinnedNow ?? liveNow;
  const today = now.toPlainDate();
  const scroller = useRef<HTMLDivElement>(null);

  const columns =
    days.length === 1
      ? "grid-cols-[3.5rem_minmax(0,1fr)]"
      : "grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]";

  const dateRowEvents = days.map((day) => eventsOn(events, day).filter((event) => event.dateRow));
  const showsToday = days.some((day) => day.equals(today));

  // Opening a week that contains today lands on the current time, not on 08:00. Only the grid
  // scrolls; the page around it stays put.
  useEffect(() => {
    const grid = scroller.current;

    if (!grid || !showsToday) return;

    grid.scrollTop = gridMinutes(now) * PX_PER_MINUTE - grid.clientHeight / 2;
    // Only when the shown week changes, not every minute.
  }, [showsToday]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn("grid border-b", columns)}>
        <div />
        {days.map((day) => {
          const isToday = day.equals(today);

          return (
            <div
              key={day.toString()}
              className="flex items-baseline justify-center gap-1.5 border-l py-2 text-sm"
            >
              <span className="text-muted-foreground">{formatDay(day, { weekday: "short" })}</span>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full font-semibold tabular-nums",
                  isToday && "bg-primary text-primary-foreground",
                )}
              >
                {day.day}
              </span>
            </div>
          );
        })}
      </div>
      {dateRowEvents.some((list) => list.length > 0) && (
        <div className={cn("grid max-h-32 overflow-y-auto border-b", columns)}>
          <div className="pt-1.5 pr-2 text-right text-xs text-muted-foreground">All day</div>
          {dateRowEvents.map((list, index) => (
            <div key={days[index]!.toString()} className="flex min-w-0 flex-col gap-1 border-l p-1">
              {list.map((event) => (
                <EventItem key={event.id} event={event} variant="row" />
              ))}
            </div>
          ))}
        </div>
      )}
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
        <div className={cn("relative grid", columns)}>
          <div>
            {hours.map((hour, index) => (
              <div key={hour} className="relative h-16">
                {index > 0 && (
                  <span className="absolute -top-2 right-2 text-xs text-muted-foreground tabular-nums">
                    {String(hour).padStart(2, "0")}:00
                  </span>
                )}
              </div>
            ))}
          </div>
          {days.map((day) => (
            <div key={day.toString()} className="relative border-l">
              {hours.map((hour) => (
                <div key={hour} className="h-16 border-b border-border/60 last:border-b-0" />
              ))}
              {layoutDay(events, day).map(({ event, top, height, column, columns: count }) => (
                <div
                  key={event.id}
                  className="absolute px-0.5 py-px"
                  style={{
                    top: top * PX_PER_MINUTE,
                    height: height * PX_PER_MINUTE,
                    left: `${(column / count) * 100}%`,
                    width: `${100 / count}%`,
                  }}
                >
                  <EventItem event={event} variant="block" />
                </div>
              ))}
              {day.equals(today) && now.hour >= DAY_START_HOUR && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                  style={{ top: gridMinutes(now) * PX_PER_MINUTE }}
                >
                  <span className="-ml-1 size-2 rounded-full bg-primary" />
                  <span className="h-0.5 flex-1 bg-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
