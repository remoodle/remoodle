import { useCallback, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

const CHANGE_EVENT = "remoodle-theme-change";

const media = () => matchMedia("(prefers-color-scheme: dark)");

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  media().addEventListener("change", onChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    media().removeEventListener("change", onChange);
  };
}

function readPreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);

  return stored === "light" || stored === "dark" ? stored : "system";
}

/** The stored preference and the theme it resolves to; the server always renders "system". */
export function useTheme() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as const);

  const systemDark = useSyncExternalStore(
    subscribe,
    () => media().matches,
    () => false,
  );

  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  const setPreference = useCallback((next: ThemePreference) => {
    if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, next);

    const dark = next === "dark" || (next === "system" && media().matches);

    document.documentElement.classList.toggle("dark", dark);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { preference, resolved, setPreference };
}
