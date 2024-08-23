import { computed } from "vue";
import { defineStore } from "pinia";
import { useColorMode } from "@vueuse/core";
import { getStorageKey } from "@/shared/utils";

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

  return {
    theme,
    toggleTheme,
  };
});
