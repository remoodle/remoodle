import type { ReactNode } from "react";
import { Temporal } from "temporal-polyfill";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDay, today, weekDays } from "@/lib/calendar-dates";
import type { CalendarEvent } from "@/lib/calendar-events";
import { AGENDA_DAYS, AgendaView } from "./agenda-view";
import { MonthView } from "./month-view";
import { TimeGridView } from "./time-grid-view";

export const calendarViews = ["month", "week", "day", "agenda"] as const;

export type CalendarView = (typeof calendarViews)[number];

const shortcuts = new Map<string, CalendarView>([
  ["m", "month"],
  ["w", "week"],
  ["d", "day"],
  ["a", "agenda"],
]);

const steps = {
  month: { months: 1 },
  week: { weeks: 1 },
  day: { days: 1 },
  agenda: { days: AGENDA_DAYS },
} as const satisfies Record<CalendarView, Temporal.DurationLike>;

function title(view: CalendarView, date: Temporal.PlainDate) {
  if (view === "day") return formatDay(date, { weekday: "long", day: "numeric", month: "long" });

  if (view === "month") return formatDay(date, { month: "long", year: "numeric" });

  const days = view === "week" ? weekDays(date) : [date, date.add({ days: AGENDA_DAYS - 1 })];
  const first = days[0]!;
  const last = days[days.length - 1]!;

  return first.month === last.month
    ? formatDay(first, { month: "long", year: "numeric" })
    : `${formatDay(first, { month: "short" })} – ${formatDay(last, { month: "short", year: "numeric" })}`;
}

type Navigation = { view?: CalendarView; date?: Temporal.PlainDate };

/**
 * The calendar canvas: toolbar plus the current view. View and date are owned by the caller
 * (the URL), so every period is linkable and the back button walks through it.
 */
export function EventCalendar({
  view,
  date,
  events,
  onNavigate,
  leading,
}: {
  view: CalendarView;
  date: Temporal.PlainDate;
  events: CalendarEvent[];
  onNavigate: (next: Navigation) => void;
  // Toolbar controls owned by the page, such as the sidebar trigger.
  leading?: ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;

      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        (target instanceof HTMLElement &&
          (target.isContentEditable || target.closest("input, textarea, select, [role=dialog]")))
      ) {
        return;
      }

      const shortcut = shortcuts.get(event.key);

      if (event.key === "t") onNavigate({ date: today() });
      else if (shortcut) onNavigate({ view: shortcut });
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNavigate]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-14 shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2">
        {leading}
        <h1 className="mr-auto truncate text-lg font-semibold tracking-tight">
          {title(view, date)}
        </h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Previous period"
            onClick={() => onNavigate({ date: date.subtract(steps[view]) })}
          >
            <ChevronLeftIcon />
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => onNavigate({ date: today() })}>
                Today
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Go to today <Kbd>T</Kbd>
            </TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Next period"
            onClick={() => onNavigate({ date: date.add(steps[view]) })}
          >
            <ChevronRightIcon />
          </Button>
        </div>
        <ToggleGroup
          type="single"
          size="sm"
          value={view}
          aria-label="Calendar view"
          onValueChange={(value) => {
            const next = calendarViews.find((item) => item === value);

            if (next) onNavigate({ view: next });
          }}
        >
          {calendarViews.map((item) => (
            <Tooltip key={item}>
              <TooltipTrigger asChild>
                <ToggleGroupItem value={item} className="capitalize">
                  {item}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <Kbd>{item[0]!.toUpperCase()}</Kbd>
              </TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>
      {view === "month" && <MonthView date={date} events={events} />}
      {view === "week" && <TimeGridView days={weekDays(date)} events={events} />}
      {view === "day" && <TimeGridView days={[date]} events={events} />}
      {view === "agenda" && <AgendaView date={date} events={events} />}
    </div>
  );
}
