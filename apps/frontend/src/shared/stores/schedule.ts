import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { getStorageKey } from "@/shared/lib/helpers";
import type { ScheduleFilter } from "@remoodle/types";
import { useStorage } from "@vueuse/core";

export const useScheduleStore = defineStore("schedule", () => {
  const filters = ref<Record<string, ScheduleFilter>>({});

  const storedFilters = useStorage(getStorageKey("scheduleFilters"), "");

  if (storedFilters.value !== "") {
    filters.value = JSON.parse(storedFilters.value);
  }

  const getDefaultFilter = (groupId: string): ScheduleFilter => ({
    selectedGroup: groupId,
    eventTypes: {
      lecture: true,
      practice: true,
      learn: true,
    },
    eventFormats: {
      online: true,
      offline: true,
    },
    excludedCourses: [],
  });

  const saveFilters = (groupId: string, newFilter: Partial<ScheduleFilter>) => {
    const currentFilter = filters.value[groupId] || getDefaultFilter(groupId);

    filters.value = {
      ...filters.value,
      [groupId]: {
        ...currentFilter,
        ...newFilter,
        eventTypes: {
          ...currentFilter.eventTypes,
          ...(newFilter.eventTypes || {}),
        },
        eventFormats: {
          ...currentFilter.eventFormats,
          ...(newFilter.eventFormats || {}),
        },
      },
    };

    storedFilters.value = JSON.stringify(filters.value);
  };

  const resetFilters = (groupId: string) => {
    filters.value = {
      ...filters.value,
      [groupId]: getDefaultFilter(groupId),
    };
    storedFilters.value = JSON.stringify(filters.value);
  };

  const removeFilters = (groupId: string) => {
    const newFilters = { ...filters.value };
    delete newFilters[groupId];
    filters.value = newFilters;
    storedFilters.value = JSON.stringify(filters.value);
  };

  const getFilters = computed(() => {
    return (groupId: string) =>
      filters.value[groupId] || getDefaultFilter(groupId);
  });

  const getAllFilters = computed(() => filters.value);

  return {
    filters,
    getFilters,
    getAllFilters,
    saveFilters,
    resetFilters,
    removeFilters,
  };
});
