<script setup lang="ts">
import type { CalendarEvent } from "@schedule-x/calendar";
import {
  type DateValue,
  DateFormatter,
  getLocalTimeZone,
  parseDate,
  today,
} from "@internationalized/date";
import { CalendarIcon, Download } from "lucide-vue-next";
import { Temporal } from "temporal-polyfill";
import { ref, computed, watch, type Ref } from "vue";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIcalTokenQuery, useUpsertIcalToken, useUpdateIcalFilters } from "@/lib/api/ical";
import { useSessionQuery } from "@/lib/api/session";
import type { ScheduleFilter } from "@/lib/types";
import { generateCalendarEventsIcal, mergeAdjacentCalendarEvents } from "../../shared/ical";

const props = defineProps<{
  filters: ScheduleFilter | undefined;
  events: CalendarEvent[];
}>();

const startValue = ref(today(getLocalTimeZone())) as Ref<DateValue>;
const value = ref(today(getLocalTimeZone()).add({ days: 14 })) as Ref<DateValue>;

const { data: session } = useSessionQuery();
const { data: tokenData, isPending: tokenPending } = useIcalTokenQuery();
const { mutate: generate, isPending: generating } = useUpsertIcalToken();
const { mutate: updateFilters, isPending: updatingFilters } = useUpdateIcalFilters();
const copied = ref(false);
const combineAdjacentPairs = ref(false);

const busy = computed(() => generating.value || updatingFilters.value);

function toCalendarEventDateTime(value: CalendarEvent["start"] | CalendarEvent["end"]) {
  if (!value) return undefined;
  if (typeof value === "string") return value;

  if (value instanceof Temporal.ZonedDateTime) {
    return `${value.toPlainDate().toString()} ${value.toPlainTime().toString({ smallestUnit: "minute" })}`;
  }

  if (value instanceof Temporal.PlainDate) {
    return `${value.toString()} 00:00`;
  }

  return undefined;
}

const normalizedEvents = computed(() =>
  props.events.map((event) => ({
    ...event,
    start: toCalendarEventDateTime(event.start),
    end: toCalendarEventDateTime(event.end),
  })),
);

function toStoredDate(value: DateValue) {
  return value.toString();
}

const effectiveFilters = computed<ScheduleFilter | undefined>(() => {
  if (!props.filters) return undefined;

  return {
    classes: props.filters.classes,
    courses: props.filters.courses,
    ical: {
      ...props.filters.ical,
      combineAdjacentPairs: combineAdjacentPairs.value,
      startDate: toStoredDate(startValue.value),
      endDate: toStoredDate(value.value),
    },
  };
});

watch(
  () => tokenData.value?.filters?.ical,
  (ical) => {
    if (!ical) return;

    if (ical.combineAdjacentPairs !== undefined) {
      combineAdjacentPairs.value = ical.combineAdjacentPairs;
    }

    if (ical.startDate) {
      startValue.value = parseDate(ical.startDate);
    }

    if (ical.endDate) {
      value.value = parseDate(ical.endDate);
    }
  },
  { immediate: true },
);

watch(
  () => props.filters?.ical,
  (ical) => {
    if (tokenData.value?.filters?.ical) return;

    combineAdjacentPairs.value = ical?.combineAdjacentPairs ?? false;

    if (ical?.startDate) {
      startValue.value = parseDate(ical.startDate);
    }

    if (ical?.endDate) {
      value.value = parseDate(ical.endDate);
    }
  },
  { immediate: true },
);

watch(
  [combineAdjacentPairs, startValue, value],
  ([nextCombine, nextStart, nextEnd], [prevCombine, prevStart, prevEnd]) => {
    if (
      nextCombine === prevCombine &&
      toStoredDate(nextStart) === toStoredDate(prevStart) &&
      toStoredDate(nextEnd) === toStoredDate(prevEnd)
    ) {
      return;
    }

    if (!tokenData.value?.url || !effectiveFilters.value || updatingFilters.value) {
      return;
    }

    updateFilters({
      filters: effectiveFilters.value,
    });
  },
);

async function copyUrl() {
  if (!tokenData.value?.url) return;
  await navigator.clipboard.writeText(tokenData.value.url);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function regenerateUrl() {
  if (!effectiveFilters.value) return;

  generate({
    filters: effectiveFilters.value,
  });
}

const df = new DateFormatter("en-US", {
  dateStyle: "long",
});

const getIcsString = () => {
  const start = new Date(`${startValue.value.toString()}T00:00:00Z`);
  const end = new Date(`${value.value.toString()}T23:59:59Z`);
  const sourceEvents = combineAdjacentPairs.value
    ? mergeAdjacentCalendarEvents(normalizedEvents.value)
    : normalizedEvents.value;

  return generateCalendarEventsIcal(
    sourceEvents
      .filter(
        (
          event,
        ): event is typeof event & {
          title: string;
          description: string;
          start: string;
        } => Boolean(event.title && event.description && event.start),
      )
      .map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        location: typeof event.location === "string" ? event.location : "",
      })),
    start,
    end,
  );
};

const getICalFile = (): void => {
  const blob = new Blob([getIcsString()], {
    type: "text/calendar;charset=utf-8",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "myCalendar.ics";
  link.click();
  URL.revokeObjectURL(link.href);
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="mt-2">
      <h1 class="flex items-center font-bold">My DU schedule</h1>
    </div>

    <div class="flex flex-col gap-3 rounded-xl border p-4">
      <div v-if="Object.keys(filters?.courses ?? {}).length" class="flex flex-col gap-2">
        <span class="text-sm font-medium">Course filters</span>
        <div v-for="(courseFilter, course) in filters?.courses" :key="course" class="text-xs">
          <p class="font-medium">{{ course }}</p>
          <p class="mt-1 flex flex-wrap gap-1 capitalize text-muted-foreground">
            <Badge :variant="courseFilter.enabled ? 'default' : 'destructive'">
              {{ courseFilter.enabled ? "Included" : "Excluded" }}
            </Badge>
            <Badge
              v-for="key in ['lecture', 'practice', 'online', 'offline'] as const"
              :key="key"
              :variant="courseFilter[key] ? 'secondary' : 'destructive'"
              >{{ key }}</Badge
            >
          </p>
        </div>
      </div>
      <p v-else class="text-sm text-muted-foreground">All classes are included.</p>
    </div>

    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium">Start date</span>
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline" class="w-full justify-start text-left font-normal">
            <CalendarIcon class="mr-2 h-4 w-4" />
            {{
              startValue ? df.format(startValue.toDate(getLocalTimeZone())) : "Pick a start date"
            }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Calendar v-model="startValue" initial-focus />
        </PopoverContent>
      </Popover>
    </div>

    <div class="flex flex-col gap-1.5">
      <span class="text-sm font-medium">End date</span>
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline" class="w-full justify-start text-left font-normal">
            <CalendarIcon class="mr-2 h-4 w-4" />
            {{ value ? df.format(value.toDate(getLocalTimeZone())) : "Pick an end date" }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Calendar v-model="value" initial-focus />
        </PopoverContent>
      </Popover>
    </div>

    <label class="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
      <Checkbox v-model="combineAdjacentPairs" class="mt-0.5" />
      <div class="space-y-1">
        <p class="text-sm leading-none font-medium">Combine adjacent pairs</p>
        <p class="text-xs text-muted-foreground">
          Merge back-to-back slots with the same course details into one iCal event.
        </p>
      </div>
    </label>

    <template v-if="session?.data">
      <div class="flex flex-col gap-3 rounded-xl border p-4">
        <div>
          <p class="text-sm font-medium">iCal subscription</p>
          <p class="mt-0.5 text-xs text-muted-foreground">
            Paste this URL into Google Calendar, Apple Calendar, or any app that supports calendar
            subscriptions.
          </p>
        </div>

        <template v-if="tokenPending || busy">
          <div class="flex h-8 items-center justify-center rounded-md border border-input bg-muted">
            <span class="text-xs text-muted-foreground">Loading...</span>
          </div>
        </template>
        <template v-else-if="tokenData?.url">
          <div class="flex gap-2">
            <input
              :value="tokenData.url"
              readonly
              class="flex h-8 min-w-0 flex-1 rounded-md border border-input bg-muted px-3 py-2 text-xs text-muted-foreground ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              @click="($event.target as HTMLInputElement).select()"
            />
            <Button variant="outline" size="sm" class="shrink-0" @click="copyUrl">
              {{ copied ? "Copied!" : "Copy" }}
            </Button>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="shrink-0 text-muted-foreground"
                    :disabled="busy || !effectiveFilters"
                  >
                    Regenerate URL
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate subscription URL?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will create a new subscription link for your schedule. Re-add the new URL
                      in Google Calendar if you are replacing an old cached subscription.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction @click="regenerateUrl"> Regenerate </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="ghost"
                size="sm"
                class="shrink-0 text-muted-foreground"
                :disabled="busy || !effectiveFilters"
                @click="updateFilters({ filters: effectiveFilters! })"
              >
                Update filters
              </Button>
            </div>
          </div>
        </template>
        <template v-else>
          <Button
            variant="outline"
            :disabled="busy || !effectiveFilters"
            @click="generate({ filters: effectiveFilters! })"
          >
            Generate link
          </Button>
          <p class="text-xs text-muted-foreground">
            Generates a subscription URL with your current filters.
          </p>
        </template>
      </div>
    </template>

    <DialogFooter>
      <Button @click="getICalFile" type="submit" class="gap-2">
        <Download class="h-4 w-4" />
        Download .ics
      </Button>
    </DialogFooter>
  </div>
</template>
