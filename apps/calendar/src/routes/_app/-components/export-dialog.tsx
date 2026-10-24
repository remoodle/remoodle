import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Temporal } from "temporal-polyfill";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  DownloadIcon,
  ShareIcon,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  generateCalendarEventsIcal,
  mergeAdjacentCalendarEvents,
  scheduleToCalendarEvents,
} from "@remoodle/shared/ical";
import { filterSchedule, type ScheduleFilter } from "@remoodle/shared/schedule";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useFilters } from "@/hooks/use-filters";
import { useTheme } from "@/hooks/use-theme";
import { formatDay, startOfWeek, today } from "@/lib/calendar-dates";
import { icalSubscriptionQuery } from "@/lib/queries";
import { drawScheduleImage, imageDays } from "@/lib/schedule-image";
import { createIcalSubscription, updateIcalSubscription } from "@/server/ical.functions";

export function ExportDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <ShareIcon data-icon="inline-start" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export your schedule</DialogTitle>
          <DialogDescription>
            Add your filtered classes to another calendar app, or share a week as an image.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="ical" className="min-w-0">
          <TabsList>
            <TabsTrigger value="ical">Calendar app</TabsTrigger>
            <TabsTrigger value="image">Image</TabsTrigger>
          </TabsList>
          <TabsContent value="ical" className="pt-4">
            <Suspense fallback={<Skeleton className="h-64" />}>
              <IcalExport />
            </Suspense>
          </TabsContent>
          <TabsContent value="image" className="pt-4">
            <ImageExport />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function IcalExport() {
  const queryClient = useQueryClient();
  const { data: subscription } = useSuspenseQuery(icalSubscriptionQuery);
  const { myDu } = useCalendarEvents();
  const { filters } = useFilters();
  const saved = subscription?.filters.ical;
  const [startDate, setStartDate] = useState(saved?.startDate ?? today().toString());
  const [endDate, setEndDate] = useState(saved?.endDate ?? today().add({ weeks: 2 }).toString());
  const [combine, setCombine] = useState(saved?.combineAdjacentPairs ?? false);
  const [copied, setCopied] = useState(false);

  const current: ScheduleFilter = {
    classes: filters.classes,
    courses: filters.courses,
    ical: { combineAdjacentPairs: combine, startDate, endDate },
  };

  const unsaved =
    subscription !== null && JSON.stringify(subscription.filters) !== JSON.stringify(current);

  const onSaved = () => queryClient.invalidateQueries({ queryKey: icalSubscriptionQuery.queryKey });

  const create = useMutation({
    mutationFn: useServerFn(createIcalSubscription),
    onSuccess: onSaved,
  });

  const update = useMutation({
    mutationFn: useServerFn(updateIcalSubscription),
    onSuccess: onSaved,
  });

  const busy = create.isPending || update.isPending;
  const validRange = startDate !== "" && endDate !== "" && startDate <= endDate;

  const downloadIcs = () => {
    const events = scheduleToCalendarEvents(filterSchedule(myDu.data?.events ?? [], current));

    const ical = generateCalendarEventsIcal(
      combine ? mergeAdjacentCalendarEvents(events) : events,
      startDate,
      endDate,
    );

    download(new Blob([ical], { type: "text/calendar;charset=utf-8" }), "remoodle-classes.ics");
  };

  const copy = async () => {
    if (!subscription) return;

    await navigator.clipboard.writeText(subscription.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const failed = (error: Error) => toast.error(error.message);

  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="export-start">From</FieldLabel>
          <Input
            id="export-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </Field>
        <Field data-invalid={!validRange || undefined}>
          <FieldLabel htmlFor="export-end">To</FieldLabel>
          <Input
            id="export-end"
            type="date"
            value={endDate}
            aria-invalid={!validRange || undefined}
            onChange={(event) => setEndDate(event.target.value)}
          />
          {!validRange && (
            <FieldDescription>The end date must come after the start.</FieldDescription>
          )}
        </Field>
      </div>
      <Field orientation="horizontal">
        <Checkbox
          id="export-combine"
          checked={combine}
          onCheckedChange={(value) => setCombine(value === true)}
        />
        <FieldContent>
          <FieldLabel htmlFor="export-combine">Combine back-to-back pairs</FieldLabel>
          <FieldDescription>One event for consecutive slots of the same class.</FieldDescription>
        </FieldContent>
      </Field>
      <FieldSet>
        <FieldLegend>Subscription link</FieldLegend>
        <FieldDescription>
          Paste it into Google Calendar or Apple Calendar to keep classes in sync. It uses your
          course filters and this date range.
        </FieldDescription>
        {subscription ? (
          <>
            <div className="flex gap-2">
              <Input
                readOnly
                value={subscription.url}
                aria-label="Subscription URL"
                onFocus={(event) => event.target.select()}
              />
              <Button variant="outline" onClick={() => void copy()}>
                {copied ? (
                  <CheckIcon data-icon="inline-start" />
                ) : (
                  <CopyIcon data-icon="inline-start" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!unsaved || busy || !validRange}
                onClick={() =>
                  update.mutate(
                    { data: { filters: current } },
                    { onError: failed, onSuccess: () => toast.success("Subscription updated") },
                  )
                }
              >
                {update.isPending && <Spinner data-icon="inline-start" />}
                {unsaved ? "Save filters to subscription" : "Subscription is up to date"}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={busy}>
                    Create a new link
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Replace the subscription link?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The current link stops working. Calendar apps that use it need the new one.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep current link</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        create.mutate({ data: { filters: current } }, { onError: failed })
                      }
                    >
                      Replace link
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        ) : (
          <Button
            variant="secondary"
            className="self-start"
            disabled={busy || !validRange}
            onClick={() => create.mutate({ data: { filters: current } }, { onError: failed })}
          >
            {create.isPending && <Spinner data-icon="inline-start" />}
            Create subscription link
          </Button>
        )}
      </FieldSet>
      <DialogFooter>
        <Button disabled={!validRange || !myDu.data?.connection} onClick={downloadIcs}>
          <DownloadIcon data-icon="inline-start" />
          Download .ics
        </Button>
      </DialogFooter>
    </FieldGroup>
  );
}

function ImageExport() {
  const { events } = useCalendarEvents();
  const { resolved } = useTheme();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [week, setWeek] = useState(() => startOfWeek(today()));
  const [error, setError] = useState("");
  const count = imageDays(events, week).reduce((total, day) => total + day.events.length, 0);
  const label = `${formatDay(week, { day: "numeric", month: "short" })} – ${formatDay(week.add({ days: 6 }), { day: "numeric", month: "short", year: "numeric" })}`;

  // Redraw when the week, the events or the theme (whose tokens the image reads) changes.
  useEffect(() => {
    if (!canvas.current) return;

    try {
      drawScheduleImage(canvas.current, events, week);
      setError("");
    } catch {
      setError("Could not create the image. Try again.");
    }
  }, [events, week, resolved]);

  const save = () =>
    canvas.current?.toBlob((blob) => {
      if (blob) download(blob, `schedule-${week.toString()}.png`);
      else setError("Could not create the image. Try again.");
    }, "image/png");

  const move = (weeks: number) => setWeek((current: Temporal.PlainDate) => current.add({ weeks }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous week"
          onClick={() => move(-1)}
        >
          <ChevronLeftIcon />
        </Button>
        <p className="text-sm font-medium" aria-live="polite">
          {label}
        </p>
        <Button variant="outline" size="icon-sm" aria-label="Next week" onClick={() => move(1)}>
          <ChevronRightIcon />
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-border">
        <canvas
          ref={canvas}
          role="img"
          aria-label={`Schedule for ${label}, ${count} events`}
          className="block h-auto w-full"
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {count
          ? "Shows what your filters show, in your current theme."
          : "No events this week. Pick another week."}
      </p>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogFooter>
        <Button disabled={!count || !!error} onClick={save}>
          <DownloadIcon data-icon="inline-start" />
          Download .png
        </Button>
      </DialogFooter>
    </div>
  );
}
