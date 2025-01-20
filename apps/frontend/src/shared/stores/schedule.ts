import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { getStorageKey } from "@/shared/lib/helpers";
import type { ScheduleFilter } from "@remoodle/types";

export const useScheduleStore = defineStore("schedule", () => {
  // State
  const filters = ref<Record<string, ScheduleFilter>>({});

  // Initialize from localStorage if exists
  const storedFilters = localStorage.getItem(getStorageKey("scheduleFilters"));
  if (storedFilters) {
    filters.value = JSON.parse(storedFilters);
  }

  // Helper function
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

  // Actions
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

    // Persist to localStorage
    localStorage.setItem(
      getStorageKey("scheduleFilters"),
      JSON.stringify(filters.value),
    );
  };

  const resetFilters = (groupId: string) => {
    filters.value = {
      ...filters.value,
      [groupId]: getDefaultFilter(groupId),
    };
    localStorage.setItem(
      getStorageKey("scheduleFilters"),
      JSON.stringify(filters.value),
    );
  };

  const removeFilters = (groupId: string) => {
    const newFilters = { ...filters.value };
    delete newFilters[groupId];
    filters.value = newFilters;
    localStorage.setItem(
      getStorageKey("scheduleFilters"),
      JSON.stringify(filters.value),
    );
  };

  // Getters
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
