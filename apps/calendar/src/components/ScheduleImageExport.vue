<script setup lang="ts">
import type { CalendarEvent } from "@schedule-x/calendar";
import { Temporal } from "temporal-polyfill";
import { ChevronLeft, ChevronRight, Download } from "lucide-vue-next";
import { computed, ref, useTemplateRef, watchEffect } from "vue";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useAppStore } from "@/stores/app";
import { drawScheduleImage, scheduleImageDays } from "@/lib/schedule-image";
import { CALENDAR_TIME_ZONE } from "../../shared/ical";

const props = defineProps<{ events: CalendarEvent[] }>();

const store = useAppStore();

const today = Temporal.Now.plainDateISO(CALENDAR_TIME_ZONE);

const week = ref(today.subtract({ days: today.dayOfWeek - 1 }));

const canvas = useTemplateRef<HTMLCanvasElement>("preview");

const error = ref("");

const exporting = ref(false);

const count = computed(() =>
  scheduleImageDays(props.events, week.value).reduce((total, day) => total + day.events.length, 0),
);

const label = computed(
  () =>
    `${week.value.toLocaleString("en-GB", { day: "numeric", month: "short" })} – ${week.value.add({ days: 6 }).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
);

watchEffect(() => {
  if (!canvas.value) {
    return;
  }

  try {
    drawScheduleImage(canvas.value, props.events, week.value, store.theme === "dark");
    error.value = "";
  } catch {
    error.value = "Could not create the image. Please try again.";
  }
});

function download() {
  if (!canvas.value) {
    return;
  }

  exporting.value = true;
  canvas.value.toBlob((blob) => {
    exporting.value = false;

    if (!blob) {
      error.value = "Could not create the image. Please try again.";

      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `schedule-${week.value.toString()}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}
</script>

<template>
  <div class="space-y-4 pt-2">
    <div class="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="icon"
        aria-label="Previous week"
        @click="week = week.subtract({ weeks: 1 })"
        ><ChevronLeft class="size-4"
      /></Button>
      <p class="text-sm font-medium" aria-live="polite">{{ label }}</p>
      <Button
        variant="outline"
        size="icon"
        aria-label="Next week"
        @click="week = week.add({ weeks: 1 })"
        ><ChevronRight class="size-4"
      /></Button>
    </div>
    <div class="overflow-hidden rounded-lg border bg-muted/30">
      <canvas
        ref="preview"
        class="block h-auto w-full"
        role="img"
        :aria-label="`Schedule preview for ${label}, ${count} events`"
      />
    </div>
    <p class="text-xs text-muted-foreground">
      {{
        count
          ? "Includes events matching your current filters."
          : "No events this week. Choose another week to export."
      }}
      The PNG uses your current light or dark theme.
    </p>
    <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
    <DialogFooter>
      <Button :disabled="!count || !!error || exporting" @click="download"
        ><Download class="size-4" />{{ exporting ? "Exporting…" : "Download .png" }}</Button
      >
    </DialogFooter>
  </div>
</template>
