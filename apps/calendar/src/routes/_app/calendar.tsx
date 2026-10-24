import { Link, createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { Temporal } from "temporal-polyfill";
import { CalendarPlusIcon } from "lucide-react";
import { useCallback } from "react";
import { z } from "zod";
import {
  EventCalendar,
  calendarViews,
  type CalendarView,
} from "@/components/event-calendar/event-calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { today } from "@/lib/calendar-dates";

const searchDefaults = { view: "week" } as const;

// `date` stays a plain ISO string in the URL; an unparseable value falls back to today.
const calendarSearchSchema = z.object({
  view: z.enum(calendarViews).default(searchDefaults.view).catch(searchDefaults.view),
  date: z.iso.date().optional().catch(undefined),
});

export const Route = createFileRoute("/_app/calendar")({
  validateSearch: calendarSearchSchema,
  search: { middlewares: [stripSearchParams(searchDefaults)] },
  head: () => ({ meta: [{ title: "Calendar · ReMoodle" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { myDu, moodle, events } = useCalendarEvents();
  const date = search.date ? Temporal.PlainDate.from(search.date) : today();

  const onNavigate = useCallback(
    (next: { view?: CalendarView; date?: Temporal.PlainDate }) =>
      void navigate({
        search: (previous) => ({
          ...previous,
          ...(next.view && { view: next.view }),
          ...(next.date && { date: next.date.equals(today()) ? undefined : next.date.toString() }),
        }),
      }),
    [navigate],
  );

  const connection = myDu.data?.connection;

  const nothingConnected =
    myDu.isSuccess && !connection && moodle.isSuccess && !moodle.data.connected;

  if (nothingConnected) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="p-3">
          <SidebarTrigger />
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarPlusIcon />
            </EmptyMedia>
            <EmptyTitle>Your week starts here</EmptyTitle>
            <EmptyDescription>
              Connect My DU for classes and Moodle for deadlines. Both take about a minute.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link to="/settings">Connect a calendar</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {((connection && (connection.syncError || !connection.connected)) || moodle.isError) && (
        <div className="flex flex-col gap-2 border-b p-3">
          {connection && (connection.syncError || !connection.connected) && (
            <Alert>
              <AlertTitle>
                {connection.syncError ? "My DU could not sync" : "My DU updates are paused"}
              </AlertTitle>
              <AlertDescription>
                {connection.syncError ?? "Showing saved classes."}{" "}
                <Link to="/settings" className="underline underline-offset-4">
                  Reconnect in settings
                </Link>
              </AlertDescription>
            </Alert>
          )}
          {moodle.isError && (
            <Alert variant="destructive">
              <AlertTitle>Moodle events did not load</AlertTitle>
              <AlertDescription>
                {moodle.error.message}{" "}
                <button
                  type="button"
                  className="underline underline-offset-4"
                  onClick={() => void moodle.refetch()}
                >
                  Try again
                </button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
      <EventCalendar
        view={search.view}
        date={date}
        events={events}
        onNavigate={onNavigate}
        leading={<SidebarTrigger />}
      />
    </div>
  );
}
