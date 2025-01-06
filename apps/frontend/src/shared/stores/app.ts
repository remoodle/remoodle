import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { useColorMode } from "@vueuse/core";
import { getStorageKey } from "@/shared/lib/helpers";

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

  // Group info (temporary in local storage)
  const group = ref<string>(localStorage.getItem(getStorageKey("group")) || "");

  const setGroup = (newGroup: string) => {
    group.value = newGroup;
    localStorage.setItem(getStorageKey("group"), newGroup);
  };

  return {
    theme,
    toggleTheme,
    group,
    setGroup,
  };
});
