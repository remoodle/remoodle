<script setup lang="ts">
import { useAppStore } from "@/shared/stores/app";
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
  group?: string;
}>();

const config: CalendarConfig = {
  views: [createViewWeek(), createViewDay()],
  events: [
    {
      id: 1,
      title: "Coffee with John",
      start: "2024-01-04 14:42",
      end: "2024-01-04 15:35",
    },
  ],
  locale: "en-US",
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

const appStore = useAppStore();

calendar.setTheme(appStore.theme);

onMounted(() => {
  calendar.render(document.getElementById("calendar") as HTMLElement);
});
</script>
<template>
  <div id="calendar"></div>
</template>

<style lang="scss" scoped></style>
