<script setup lang="ts">
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Badge } from "@/shared/ui/badge";
import { type Ref, ref, watch } from "vue";
import type { DateRange } from 'radix-vue';
import { RangeCalendar } from '@/shared/ui/range-calendar';
import { useAppStore } from "@/shared/stores/app";
import { useScheduleStore } from "@/shared/stores/schedule";
import type { ScheduleFilter } from "@remoodle/types";
import type { CalendarEvent } from "@schedule-x/calendar";
import { CalendarIcon } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { type DateValue, CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date';
import dayjs, { Dayjs } from "dayjs";

const props = defineProps<{
  events: CalendarEvent[];
}>();

const appStore = useAppStore();
const scheduleStore = useScheduleStore();

const df = new DateFormatter('en-US', {
  dateStyle: 'medium',
});

const value = ref({
  start: new CalendarDate(2025, 2, 2),
  end: new CalendarDate(2022, 3, 3),
}) as unknown as Ref<DateRange>;

console.log(value);

const filters = ref<ScheduleFilter>(scheduleStore.getFilters(appStore.group));

let open = ref<boolean>(false);

watch(
  () => scheduleStore.getFilters(appStore.group),
  (newFilters: ScheduleFilter) => {
    filters.value = newFilters;
  },
);

const getIcsString = () => {
  const icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ReMoodle//Calendar Export//EN",
  ];

  const formatDateValueToDayjs = (dateVal: DateValue | undefined): dayjs.Dayjs => {
    if (!dateVal) {
      return dayjs();
    }

    const { year, month, day } = dateVal;
    return dayjs(new Date(year, month, day));
  };

  const start = formatDateValueToDayjs(value.value.start);

  if (!start || !end) {
    return "";
  }

  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  };

  const parseDate = (dateString: string) => {
    const [datePart, timePart] = dateString.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  };

  props.events.forEach((event) => {
    if (event.title && event.description && event.start && event.end) {
      const startDate = parseDate(event.start);
      const endDate = parseDate(event.end);

      // for (let current = new Date(startDate); current <= endDate; current = addDays(current, 7)) {
      //   icalContent.push(
      //     `BEGIN:VEVENT`,
      //     `UID:${event.id}-${current.toISOString()}`,
      //     `SUMMARY:${escapeText(event.title)}`,
      //     `DTSTART:${formatDate({
      //       year: current.getFullYear(),
      //       month: current.getMonth() + 1,
      //       day: current.getDate(),
      //     } as DateValue)}`,
      //     `DTEND:${formatDate({
      //       year: current.getFullYear(),
      //       month: current.getMonth() + 1,
      //       day: current.getDate(),
      //     } as DateValue)}`,
      //     `DESCRIPTION:${escapeText(event.description)}`,
      //     `LOCATION:Astana IT University`,
      //     `END:VEVENT`
      //   );
      // }
    }
  });

  icalContent.push("END:VCALENDAR");

  return icalContent.join("\n");
};

const getICalFile = (): void => {
  const blob = new Blob([getIcsString()], { type: 'text/calendar;charset=utf-8' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = "myCalendar.ics";
  link.click();
  URL.revokeObjectURL(link.href);
};
</script>

<template>
  <Dialog v-model:open="open" @update:open="open = $event">
    <DialogTrigger as-child>
      <Button class="px-16 py-5">Export to .ical file</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Create iCalendar file</DialogTitle>
        <DialogDescription>
          Make changes to your calendar using filter and choose time frame of
          events.
        </DialogDescription>
      </DialogHeader>

      <div class="mt-2">
        <h1 class="">
          Selected group
          <Badge variant="outline">{{ appStore.group }}</Badge>
        </h1>
      </div>

      <div class="rounded-xl border p-4">
        <!-- <h1 class="mb-2 font-semibold">Toggled filters:</h1> -->

        <div class="">
          <div class="">Event types:</div>
          <div class="my-2 flex select-none gap-1">
            <span v-for="(enabled, type) in filters.eventTypes" :key="type">
              <Badge :variant="enabled ? 'default' : 'destructive'">
                {{ type }}
              </Badge>
            </span>
          </div>
        </div>

        <hr class="my-2" />

        <div class="">
          <div class="">Event formats:</div>
          <div class="my-2 flex select-none gap-1">
            <span v-for="(enabled, format) in filters.eventFormats" :key="format">
              <Badge :variant="enabled ? 'default' : 'destructive'">
                {{ format }}
              </Badge>
            </span>
          </div>
        </div>

        <div v-if="filters.excludedCourses.length > 0">
          <hr class="my-2" />

          <div class="">
            <div class="">Excluded courses:</div>
            <div class="my-2 flex select-none flex-wrap gap-1">
              <span v-for="course in filters.excludedCourses" :key="course">
                <Badge variant="destructive">
                  {{ course }}
                </Badge>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="w-[280px] justify-start text-left font-normal                    ">
              <CalendarIcon class="mr-2 h-4 w-4" />
              <template v-if="value.start">
                <template v-if="value.end">
                  {{ df.format(value.start.toDate(getLocalTimeZone())) }} - {{
                    df.format(value.end.toDate(getLocalTimeZone())) }}
                </template>

                <template v-else>
                  {{ df.format(value.start.toDate(getLocalTimeZone())) }}
                </template>
              </template>
              <template v-else>
                Pick a date
              </template>
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <RangeCalendar v-model="value" initial-focus :number-of-months="2"
              @update:start-value="(startDate: CalendarDate) => value.start = startDate" />
          </PopoverContent>
        </Popover>
      </div>

      <DialogFooter>
        <Button @click="getICalFile" type="submit"> Get file </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
