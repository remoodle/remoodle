import type { ComponentProps } from "react";
import { cn } from "cn";
import { ClockIcon, MapPinIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDay, formatTime, isPast } from "@/lib/calendar-dates";
import type { CalendarEvent } from "@/lib/calendar-events";
import { eventKinds } from "@/lib/event-kinds";

function timeLabel(event: CalendarEvent) {
  if (event.deadline) return `Due ${event.deadline}`;

  if (event.dateRow) return "All day";

  return `${formatTime(event.start)} – ${formatTime(event.end)}`;
}

/**
 * One event on the calendar. Each layout is a variant: `block` fills its slot in the time grid,
 * `row` is a single line in the date row or a month cell, `card` is a full entry in the agenda.
 * Clicking opens the event's details.
 */
export function EventItem({
  event,
  variant,
  className,
  ...props
}: { event: CalendarEvent; variant: "block" | "row" | "card" } & ComponentProps<"button">) {
  const kind = eventKinds[event.kind];
  // An hour-long slot fits one line of title above the time; longer ones get two.
  const short = event.start.until(event.end).total("minutes") < 75;
  // My DU's lesson type often repeats the calendar name ("Lectures"); say it once.
  const details = event.details.filter((detail) => detail !== kind.label);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-past={isPast(event) || undefined}
          className={cn(
            "flex w-full min-w-0 rounded-md text-left text-[13px] leading-tight outline-none transition-[filter,opacity] duration-130 hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring data-past:opacity-60 dark:hover:brightness-125",
            kind.fill,
            variant === "block" && "h-full flex-col gap-0.5 overflow-hidden px-2 py-1.5",
            variant === "row" && "h-6 items-center gap-1.5 px-2",
            variant === "card" && "flex-col gap-1 px-3 py-2.5",
            className,
          )}
          {...props}
        >
          {variant === "row" ? (
            <span className="truncate font-semibold">
              {event.deadline && (
                <span className="font-normal tabular-nums opacity-75">{event.deadline} </span>
              )}
              {event.title}
            </span>
          ) : (
            <>
              <span
                className={cn(
                  "font-semibold",
                  short && variant === "block" ? "truncate" : "line-clamp-2",
                )}
              >
                {event.title}
              </span>
              <span className="truncate tabular-nums opacity-75">
                {timeLabel(event)}
                {event.location && ` · ${event.location}`}
              </span>
              {variant === "card" && event.details.length > 0 && (
                <span className="truncate opacity-75">{event.details[0]}</span>
              )}
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="flex items-start gap-3">
          <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", kind.dot)} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="font-semibold">{event.title}</p>
            <p className="text-muted-foreground">{kind.label}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-muted-foreground">
          <p className="flex items-center gap-2">
            <ClockIcon className="size-4 shrink-0" />
            <span className="tabular-nums">
              {formatDay(event.start.toPlainDate(), {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}
              , {timeLabel(event)}
            </span>
          </p>
          {event.location && (
            <p className="flex items-center gap-2">
              <MapPinIcon className="size-4 shrink-0" />
              <span>{event.location}</span>
            </p>
          )}
        </div>
        {details.length > 0 && (
          <p className="max-h-48 overflow-y-auto whitespace-pre-line text-muted-foreground">
            {details.join("\n\n")}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
