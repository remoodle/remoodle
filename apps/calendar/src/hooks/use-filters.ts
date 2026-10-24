import { useCallback, useMemo, useSyncExternalStore } from "react";
import { FILTERS_STORAGE_KEY, parseStoredFilters, type StoredFilters } from "@/lib/filters";

const CHANGE_EVENT = "remoodle-filters-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const readRaw = () => localStorage.getItem(FILTERS_STORAGE_KEY);

/** Calendar filters persisted per browser. App routes render on the client, so storage is always there. */
export function useFilters() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const filters = useMemo(() => parseStoredFilters(raw), [raw]);

  const setFilters = useCallback((update: (current: StoredFilters) => StoredFilters) => {
    localStorage.setItem(
      FILTERS_STORAGE_KEY,
      JSON.stringify(update(parseStoredFilters(readRaw()))),
    );
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { filters, setFilters };
}
