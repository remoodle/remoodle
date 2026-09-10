<script setup lang="ts">
import { Checkbox } from "@/components/ui/checkbox";
import { moodleKinds, defaultMoodleFilters, type MoodleFilters } from "../../shared/moodle";

const props = defineProps<{ modelValue: MoodleFilters | undefined }>();
const emit = defineEmits<{ "update:modelValue": [value: MoodleFilters] }>();

function setFilter(key: keyof MoodleFilters, value: boolean) {
  emit("update:modelValue", { ...defaultMoodleFilters(), ...props.modelValue, [key]: value });
}
</script>

<template>
  <div class="flex flex-col px-1">
    <label
      v-for="(label, key) in moodleKinds"
      :key="key"
      class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent"
    >
      <Checkbox
        :model-value="modelValue?.[key] ?? defaultMoodleFilters()[key]"
        @update:model-value="setFilter(key, $event === true)"
      />
      <span>{{ label }}</span>
    </label>
    <p class="px-2 pt-3 text-xs text-muted-foreground">
      Attendance is hidden by default to avoid duplicating classes.
    </p>
  </div>
</template>
