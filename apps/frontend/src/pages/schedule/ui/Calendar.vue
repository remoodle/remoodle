<script setup lang="ts">
import { createEventRecurrencePlugin } from "@schedule-x/event-recurrence";
import { createEventModalPlugin } from "@schedule-x/event-modal";
import { createCurrentTimePlugin } from "@schedule-x/current-time";
import {
  createCalendar,
  createViewDay,
  createViewWeek,
} from "@schedule-x/calendar";
import type { CalendarConfig, CalendarEvent } from "@schedule-x/calendar";
import "@schedule-x/theme-default/dist/index.css";
import { onMounted } from "vue";

const props = defineProps<{
  events: CalendarEvent[];
  minDate?: string;
  maxDate?: string;
}>();

const config: CalendarConfig = {
  views: [createViewWeek(), createViewDay()],
  plugins: [
    createEventRecurrencePlugin(),
    createEventModalPlugin(),
    createCurrentTimePlugin(),
  ],
  events: props.events,
  locale: "en-GB",
  minDate: props.minDate,
  maxDate: props.maxDate,
  dayBoundaries: {
    start: "08:00",
    end: "21:00",
  },
  weekOptions: {
    gridHeight: 800,
    nDays: 6,
  },
  monthGridOptions: {
    nEventsPerDay: 8,
  },
  isResponsive: true,
};

const calendar = createCalendar(config);

// const appStore = useAppStore();
// calendar.setTheme(appStore.theme);

onMounted(() => {
  calendar.render(document.getElementById("calendar") as HTMLElement);
});
</script>
<template>
  <div id="calendar"></div>
</template>
