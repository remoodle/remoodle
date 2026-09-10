<script setup lang="ts">
import type { CalendarEvent } from "@schedule-x/calendar";
import { CalendarIcon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogScrollContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import IcalExportOptions from "@/components/IcalExportOptions.vue";
import ScheduleImageExport from "@/components/ScheduleImageExport.vue";
import type { ScheduleFilter } from "@/lib/types";

defineProps<{
  filters: ScheduleFilter | undefined;
  events: CalendarEvent[];
  buttonClass?: string;
}>();
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button size="sm" variant="outline" :class="buttonClass"
        ><CalendarIcon class="size-3.5" />Export</Button
      >
    </DialogTrigger>
    <DialogScrollContent class="rounded-2xl sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle class="text-left text-2xl font-bold">Export Schedule</DialogTitle>
        <DialogDescription class="text-left"
          >Save your filtered schedule to your calendar or as an image.</DialogDescription
        >
      </DialogHeader>
      <Tabs default-value="ical" class="min-w-0">
        <TabsList class="export-tabs" aria-label="Export format">
          <TabsTrigger value="ical">iCal</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
        </TabsList>
        <TabsContent value="ical"
          ><IcalExportOptions :events="events" :filters="filters"
        /></TabsContent>
        <TabsContent value="image"><ScheduleImageExport :events="events" /></TabsContent>
      </Tabs>
    </DialogScrollContent>
  </Dialog>
</template>

<style scoped>
.export-tabs {
  width: 100%;
  height: auto;
  justify-content: flex-start;
  gap: 1.5rem;
  padding: 0;
  border-bottom: 1px solid var(--border);
  border-radius: 0;
  background: transparent;
}

.export-tabs :deep([data-slot="tabs-trigger"]) {
  flex: none;
  height: auto;
  margin-bottom: -1px;
  padding: 0.625rem 0.125rem;
  border: 0;
  border-bottom: 2px solid transparent;
  border-radius: 0;
  background: transparent;
  color: var(--muted-foreground);
  box-shadow: none;
}

.export-tabs :deep([data-slot="tabs-trigger"]:hover),
.export-tabs :deep([data-state="active"]) {
  color: var(--foreground);
}

.export-tabs :deep([data-state="active"]) {
  border-bottom-color: var(--foreground);
}
</style>
