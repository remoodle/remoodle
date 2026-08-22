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
import {
  Dialog,
  DialogScrollContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIcalTokenQuery, useUpsertIcalToken, useUpdateIcalFilters } from "@/lib/api/ical";
import { useSessionQuery } from "@/lib/api/session";
import type { ScheduleFilter } from "@/lib/types";
import { generateCalendarEventsIcal, mergeAdjacentCalendarEvents } from "../../shared/ical";

const props = defineProps<{
  group: string;
  filters: ScheduleFilter | undefined;
  events: CalendarEvent[];
  buttonClass?: string;
}>();

const startValue = ref(today(getLocalTimeZone())) as Ref<DateValue>;
const value = ref(today(getLocalTimeZone()).add({ days: 14 })) as Ref<DateValue>;

const open = ref<boolean>(false);

const { data: session } = useSessionQuery();
const { data: tokenData, isPending: tokenPending } = useIcalTokenQuery(() => props.group);
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
    ...props.filters,
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
      group: props.group,
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
    group: props.group,
    filters: effectiveFilters.value,
  });
}

const df = new DateFormatter("en-US", {
  dateStyle: "long",
});

const getIcsString = () => {
  const start = startValue.value.toDate(getLocalTimeZone());
  const end = value.value.toDate(getLocalTimeZone());
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
        location: "Astana IT University",
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
  <Dialog v-model:open="open" @update:open="open = $event">
    <DialogTrigger as-child>
      <Button size="sm" variant="outline" :class="props.buttonClass">
        <CalendarIcon class="h-3.5 w-3.5" />
        Export
      </Button>
    </DialogTrigger>
    <DialogScrollContent class="max-w-lg rounded-2xl">
      <DialogHeader>
        <DialogTitle class="text-left text-2xl font-bold">Create iCalendar file</DialogTitle>
        <DialogDescription class="text-ms text-left">
          Make changes to your calendar using <strong>filters</strong> and choose
          <strong>end date</strong> for events. Choose the date range for exported events.
        </DialogDescription>
      </DialogHeader>

      <div class="mt-2">
        <h1 class="flex items-center font-bold">
          {{ group }}
        </h1>
      </div>

      <div class="flex flex-col gap-3 rounded-xl border p-4">
        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium">Event Types</span>
          <div class="flex flex-wrap gap-1 select-none">
            <Badge
              v-for="(enabled, type) in filters?.eventTypes"
              :key="type"
              :variant="enabled ? 'default' : 'destructive'"
              >{{ type }}</Badge
            >
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium">Event Formats</span>
          <div class="flex flex-wrap gap-1 select-none">
            <Badge
              v-for="(enabled, format) in filters?.eventFormats"
              :key="format"
              :variant="enabled ? 'default' : 'destructive'"
              >{{ format }}</Badge
            >
          </div>
        </div>

        <div v-if="filters?.excludedCourses?.length" class="flex flex-col gap-1.5">
          <span class="text-sm font-medium">Excluded Courses</span>
          <div class="flex flex-wrap gap-1 select-none">
            <Badge v-for="course in filters?.excludedCourses" :key="course" variant="destructive">{{
              course
            }}</Badge>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-sm font-medium">Start Date</span>
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
        <span class="text-sm font-medium">End Date</span>
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
            <p class="text-sm font-medium">iCal Subscription</p>
            <p class="mt-0.5 text-xs text-muted-foreground">
              Paste this URL into Google Calendar, Apple Calendar, or any app that supports calendar
              subscriptions.
            </p>
          </div>

          <template v-if="tokenPending || busy">
            <div
              class="flex h-8 items-center justify-center rounded-md border border-input bg-muted"
            >
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
                        This will create a new subscription link for this group. Re-add the new URL
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
                  @click="updateFilters({ group, filters: effectiveFilters! })"
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
              @click="generate({ group, filters: effectiveFilters! })"
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
    </DialogScrollContent>
  </Dialog>
</template>
