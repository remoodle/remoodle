<script setup lang="ts">
import type { CalendarEvent } from "@schedule-x/calendar";
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import { CalendarIcon, Download } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import IcalSubscription from "@/components/IcalSubscription.vue";
import { useIcalExport } from "@/composables/use-ical-export";
import { createScheduleIcal } from "@/lib/schedule-ical";
import type { ScheduleFilter } from "../../shared/schedule";

const props = defineProps<{ filters: ScheduleFilter | undefined; events: CalendarEvent[] }>();

const {
  startValue,
  value,
  combineAdjacentPairs,
  session,
  tokenData,
  tokenPending,
  busy,
  copied,
  effectiveFilters,
  copyUrl,
  regenerateUrl,
  updateFilters,
} = useIcalExport(() => props.filters);

const df = new DateFormatter("en-US", { dateStyle: "long" });

function saveFilters() {
  if (effectiveFilters.value) {
    updateFilters({ filters: effectiveFilters.value });
  }
}

function getICalFile() {
  const content = createScheduleIcal(
    props.events,
    startValue.value.toString(),
    value.value.toString(),
    combineAdjacentPairs.value,
  );

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "myCalendar.ics";
  link.click();
  URL.revokeObjectURL(link.href);
}
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

    <IcalSubscription
      v-if="session?.data"
      :url="tokenData?.url"
      :token-pending="tokenPending"
      :busy="busy"
      :copied="copied"
      :can-update="!!effectiveFilters"
      @copy="copyUrl"
      @generate="regenerateUrl"
      @update-filters="saveFilters"
    />

    <DialogFooter>
      <Button @click="getICalFile" type="submit" class="gap-2">
        <Download class="h-4 w-4" />
        Download .ics
      </Button>
    </DialogFooter>
  </div>
</template>
