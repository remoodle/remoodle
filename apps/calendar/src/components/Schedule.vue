<script setup lang="ts">
import type { CalendarEvent } from "@schedule-x/calendar";
import "@schedule-x/theme-shadcn/dist/index.css";
import { createCalendar, createViewWeek, createViewMonthAgenda } from "@schedule-x/calendar";
import { createCalendarControlsPlugin } from "@schedule-x/calendar-controls";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createEventRecurrencePlugin } from "@schedule-x/event-recurrence";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar } from "@schedule-x/vue";
import { ZoomInPlugin } from "@starredev/schedule-x-plugins";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import { Temporal } from "temporal-polyfill";
import { computed, ref, watchEffect } from "vue";
import { Button } from "@/components/ui/button";
import { CALENDAR_TIME_ZONE } from "../../shared/ical";

const props = defineProps<{
  events: CalendarEvent[];
  theme: "light" | "dark";
}>();

const today = Temporal.Now.plainDateISO(CALENDAR_TIME_ZONE);
const selectedDate = ref(today);
const dateLabel = computed(() =>
  new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(selectedDate.value.year, selectedDate.value.month - 1, selectedDate.value.day),
  ),
);

const eventsServicePlugin = createEventsServicePlugin();
const calendarControlsPlugin = createCalendarControlsPlugin();

const calendarApp = createCalendar({
  timezone: CALENDAR_TIME_ZONE,
  views: [createViewWeek(), createViewMonthAgenda()],
  plugins: [
    createEventRecurrencePlugin(),
    createEventModalPlugin(),
    createCurrentTimePlugin(),
    eventsServicePlugin,
    calendarControlsPlugin,
    new ZoomInPlugin(calendarControlsPlugin, {
      zoomStep: 0.01,
    }),
  ],
  calendars: {
    lecture: {
      colorName: "blue",
      label: "Lectures",
      lightColors: {
        main: "#2563EB",
        container: "#DBEAFE",
        onContainer: "#1E3A8A",
      },
      darkColors: {
        main: "#93C5FD",
        container: "#1E3A5F",
        onContainer: "#EFF6FF",
      },
    },
    online: {
      colorName: "blue",
      label: "Online",
      lightColors: {
        main: "#2196F3",
        container: "#BBDEFB",
        onContainer: "#0D47A1",
      },
      darkColors: {
        main: "#90CAF9",
        container: "#1E3A5F",
        onContainer: "#E3F2FD",
      },
    },
    offline: {
      colorName: "red",
      label: "Offline",
      lightColors: {
        main: "#F44336",
        container: "#FFCDD2",
        onContainer: "#B71C1C",
      },
      darkColors: {
        main: "#EF9A9A",
        container: "#4A2020",
        onContainer: "#FFEBEE",
      },
    },
    "moodle-assignment": {
      colorName: "green",
      label: "Moodle assignments",
      lightColors: {
        main: "#4CAF50",
        container: "#C8E6C9",
        onContainer: "#1B5E20",
      },
      darkColors: {
        main: "#A5D6A7",
        container: "#1C3A28",
        onContainer: "#E8F5E9",
      },
    },
    "moodle-attendance": {
      colorName: "slate",
      label: "Moodle attendance",
      lightColors: { main: "#64748b", container: "#e2e8f0", onContainer: "#1e293b" },
      darkColors: { main: "#94a3b8", container: "#253247", onContainer: "#e2e8f0" },
    },
    "moodle-other": {
      colorName: "purple",
      label: "Moodle events",
      lightColors: { main: "#8b5cf6", container: "#ede9fe", onContainer: "#4c1d95" },
      darkColors: { main: "#c4b5fd", container: "#382550", onContainer: "#ede9fe" },
    },
  },
  events: props.events,
  locale: "en-GB",
  selectedDate: selectedDate.value,
  isResponsive: true,
  dayBoundaries: {
    start: "08:00",
    end: "24:00",
  },
  weekOptions: {
    gridHeight: 1050,
    nDays: 7,
  },
  theme: "shadcn",
  callbacks: {
    onSelectedDateUpdate(date) {
      selectedDate.value = date;
    },
  },
});

function movePeriod(direction: -1 | 1) {
  const current = calendarControlsPlugin.getDate();
  const duration = calendarControlsPlugin.getView().includes("month")
    ? { months: direction }
    : { weeks: direction };
  const next = current.add(duration);
  calendarControlsPlugin.setDate(next);
  selectedDate.value = next;
}

function goToday() {
  calendarControlsPlugin.setDate(today);
  selectedDate.value = today;
}

watchEffect(() => {
  calendarApp.setTheme(props.theme);
});

watchEffect(() => {
  eventsServicePlugin.set(props.events);
});
</script>

<template>
  <div class="flex min-h-0 flex-col">
    <div class="flex h-12 shrink-0 items-center gap-1 border-b px-3">
      <Button variant="outline" size="sm" @click="goToday">Today</Button>
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        aria-label="Previous period"
        @click="movePeriod(-1)"
      >
        <ChevronLeft class="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        aria-label="Next period"
        @click="movePeriod(1)"
      >
        <ChevronRight class="size-4" />
      </Button>
      <p class="min-w-0 truncate pl-2 text-sm font-semibold sm:text-base">{{ dateLabel }}</p>
    </div>
    <ScheduleXCalendar class="min-h-0 flex-1" :calendar-app="calendarApp" />
  </div>
</template>
