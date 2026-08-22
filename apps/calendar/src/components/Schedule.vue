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
import { Temporal } from "temporal-polyfill";
import { watchEffect } from "vue";
import { CALENDAR_TIME_ZONE } from "../../shared/ical";

const props = defineProps<{
  events: CalendarEvent[];
  theme: "light" | "dark";
}>();

const today = Temporal.Now.plainDateISO(CALENDAR_TIME_ZONE);
const weekStart =
  today.dayOfWeek === 7 ? today.add({ days: 1 }) : today.subtract({ days: today.dayOfWeek - 1 });
const selectedDate = today.dayOfWeek === 7 ? today.add({ days: 1 }) : today;
const minDate = weekStart;
const maxDate = weekStart.add({ days: 6 });

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
    learn: {
      colorName: "green",
      label: "Learn",
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
  },
  events: props.events,
  locale: "en-GB",
  selectedDate,
  minDate,
  maxDate,
  isResponsive: true,
  dayBoundaries: {
    start: "08:00",
    end: "22:00",
  },
  weekOptions: {
    gridHeight: 1050,
    nDays: 6,
  },
  theme: "shadcn",
});

watchEffect(() => {
  calendarApp.setTheme(props.theme);
});

watchEffect(() => {
  eventsServicePlugin.set(props.events);
});
</script>

<template>
  <ScheduleXCalendar :calendar-app="calendarApp" />
</template>
