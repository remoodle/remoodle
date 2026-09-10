import { useColorMode, useStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed } from "vue";
import { getStorageKey } from "@/lib/helpers";
import { defaultFilters, type ScheduleFilter } from "../../shared/schedule";

export const useAppStore = defineStore("app", () => {
  const { store: storedTheme, system: systemTheme } = useColorMode({
    modes: { light: "light", dark: "dark" },
    storageKey: getStorageKey("theme"),
  });
  const toggleTheme = () => {
    storedTheme.value = storedTheme.value === "light" ? "dark" : "light";
  };
  const theme = computed<"light" | "dark">(() =>
    storedTheme.value === "auto" ? systemTheme.value : storedTheme.value,
  );
  const filters = useStorage<ScheduleFilter>(
    getStorageKey("schedule-filters"),
    defaultFilters(),
    undefined,
    {
      mergeDefaults: true,
    },
  );
  return { theme, toggleTheme, filters };
});
