import { useColorMode, useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, watchEffect } from "vue";
import { getStorageKey } from "@/lib/helpers";
import type { ScheduleFilter } from "@/lib/types";

export const useAppStore = defineStore("app", () => {
  const { store: storedTheme, system: systemTheme } = useColorMode({
    modes: {
      light: "light",
      dark: "dark",
    },
    storageKey: getStorageKey("theme"),
  });

  const toggleTheme = () => {
    storedTheme.value = storedTheme.value === "light" ? "dark" : "light";
  };

  const theme = computed<"light" | "dark">(() => {
    if (storedTheme.value === "auto") {
      return systemTheme.value;
    }

    return storedTheme.value;
  });

  const group = useLocalStorage(getStorageKey("group"), "");

  const filters = useLocalStorage<Record<string, ScheduleFilter>>(
    getStorageKey("scheduleFilters"),
    {},
  );

  watchEffect(() => {
    if (group.value && !filters.value[group.value]) {
      filters.value[group.value] = {
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
        ical: {
          combineAdjacentPairs: false,
        },
      };
    } else if (group.value) {
      filters.value[group.value]!.ical ??= {
        combineAdjacentPairs: false,
      };
    }
  });

  return {
    theme,
    toggleTheme,
    filters,
    group,
  };
});
