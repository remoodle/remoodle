import { computed } from "vue";
import { defineStore } from "pinia";
import { useStorage, useColorMode } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";
import { getStorageKey } from "@/shared/utils";
import type { Providers, Provider } from "@/shared/types";
import { defaultProviders } from "@/shared/config";

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

  const availableProviders = useStorage<Providers>(
    getStorageKey("providers"),
    Object.assign({}, defaultProviders),
  );

  const providerId: RemovableRef<string> = useStorage(
    getStorageKey("provider"),
    Object.keys(availableProviders.value)[0],
  );

  const selectedProvider = computed<Provider | undefined>(() => {
    return availableProviders.value[providerId.value];
  });

  return {
    theme,
    toggleTheme,
    providerId,
    availableProviders,
    selectedProvider,
  };
});
