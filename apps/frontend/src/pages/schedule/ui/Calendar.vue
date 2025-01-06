<script setup lang="ts">
import { createEventRecurrencePlugin } from "@schedule-x/event-recurrence";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import {
  createCalendar,
  createViewDay,
  createViewWeek,
} from "@schedule-x/calendar";
import type {
  CalendarConfig,
  CalendarEvent,
  CalendarType,
} from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/index.css";
import { onMounted } from "vue";
import { useAppStore } from "@/shared/stores/app";

const props = defineProps<{
  events: CalendarEvent[];
  minDate?: string;
  maxDate?: string;
}>();

const calendars: Record<string, CalendarType> = {
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
};

console.log(props);

const config: CalendarConfig = {
  views: [createViewWeek(), createViewDay()],
  plugins: [
    createEventRecurrencePlugin(),
    createEventModalPlugin(),
    createCurrentTimePlugin(),
  ],
  calendars: calendars,
  events: props.events,
  locale: "en-GB",
  minDate: props.minDate,
  maxDate: props.maxDate,
  dayBoundaries: {
    start: "08:00",
    end: "21:00",
  },
  weekOptions: {
    gridHeight: 900,
    nDays: 6,
  },
};

const calendar = createCalendar(config);

const appStore = useAppStore();
calendar.setTheme(appStore.theme);

onMounted(() => {
  calendar.render(document.getElementById("calendar") as HTMLElement);
});
</script>
<template>
  <div id="calendar"></div>
</template>
