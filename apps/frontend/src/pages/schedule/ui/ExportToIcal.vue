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
import { ref, watch } from "vue";
import { useAppStore } from "@/shared/stores/app";
import { useScheduleStore } from "@/shared/stores/schedule";
import type { ScheduleFilter } from "@remoodle/types";

const appStore = useAppStore();
const scheduleStore = useScheduleStore();

const filters = ref<ScheduleFilter>(scheduleStore.getFilters(appStore.group));

let open = ref<boolean>(false);

watch(
  () => scheduleStore.getFilters(appStore.group),
  (newFilters: ScheduleFilter) => {
    filters.value = newFilters;
  },
);
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
          Selected group →
          <span class="font-semibold">{{ appStore.group }}</span>
        </h1>
      </div>

      <div class="">
        <!-- <h1 class="mb-2 font-semibold">Toggled filters:</h1> -->

        <div class="flex flex-col gap-2">
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
          <div class="">
            <div class="">Event formats:</div>
            <div class="my-2 flex select-none gap-1">
              <span
                v-for="(enabled, format) in filters.eventFormats"
                :key="format"
              >
                <Badge :variant="enabled ? 'default' : 'destructive'">
                  {{ format }}
                </Badge>
              </span>
            </div>
          </div>
        </div>

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

      <DialogFooter>
        <Button type="submit"> Get file (wip) </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
