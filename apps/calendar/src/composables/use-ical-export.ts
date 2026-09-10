import { shallowRef, computed, watch } from "vue";
import { type DateValue, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { useIcalTokenQuery, useUpsertIcalToken, useUpdateIcalFilters } from "@/lib/api/ical";
import { useSessionQuery } from "@/lib/api/session";
import type { ScheduleFilter } from "../../shared/schedule";

export function useIcalExport(filters: () => ScheduleFilter | undefined) {
  const startValue = shallowRef<DateValue>(today(getLocalTimeZone()));
  const value = shallowRef<DateValue>(today(getLocalTimeZone()).add({ days: 14 }));

  const { data: session } = useSessionQuery();
  const { data: tokenData, isPending: tokenPending } = useIcalTokenQuery();
  const { mutate: generate, isPending: generating } = useUpsertIcalToken();
  const { mutate: updateFilters, isPending: updatingFilters } = useUpdateIcalFilters();
  const copied = shallowRef(false);
  const combineAdjacentPairs = shallowRef(false);

  const busy = computed(() => generating.value || updatingFilters.value);

  function toStoredDate(value: DateValue) {
    return value.toString();
  }

  const effectiveFilters = computed<ScheduleFilter | undefined>(() => {
    const currentFilters = filters();
    if (!currentFilters) {
      return undefined;
    }

    return {
      classes: currentFilters.classes,
      courses: currentFilters.courses,
      ical: {
        ...currentFilters.ical,
        combineAdjacentPairs: combineAdjacentPairs.value,
        startDate: toStoredDate(startValue.value),
        endDate: toStoredDate(value.value),
      },
    };
  });

  watch(
    () => tokenData.value?.filters?.ical,
    (ical) => {
      if (!ical) {
        return;
      }

      if (ical.combineAdjacentPairs !== undefined) {
        combineAdjacentPairs.value = ical.combineAdjacentPairs;
      }

      if (ical.startDate) {
        startValue.value = parseDate(ical.startDate);
      }

      if (ical.endDate) {
        value.value = parseDate(ical.endDate);
      }
    },
    { immediate: true },
  );

  watch(
    () => filters()?.ical,
    (ical) => {
      if (tokenData.value?.filters?.ical) {
        return;
      }

      combineAdjacentPairs.value = ical?.combineAdjacentPairs ?? false;

      if (ical?.startDate) {
        startValue.value = parseDate(ical.startDate);
      }

      if (ical?.endDate) {
        value.value = parseDate(ical.endDate);
      }
    },
    { immediate: true },
  );

  watch(
    [combineAdjacentPairs, startValue, value],
    ([nextCombine, nextStart, nextEnd], [prevCombine, prevStart, prevEnd]) => {
      if (
        nextCombine === prevCombine &&
        toStoredDate(nextStart) === toStoredDate(prevStart) &&
        toStoredDate(nextEnd) === toStoredDate(prevEnd)
      ) {
        return;
      }

      if (!tokenData.value?.url || !effectiveFilters.value || updatingFilters.value) {
        return;
      }

      updateFilters({
        filters: effectiveFilters.value,
      });
    },
  );

  async function copyUrl() {
    if (!tokenData.value?.url) {
      return;
    }
    await navigator.clipboard.writeText(tokenData.value.url);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  }

  function regenerateUrl() {
    if (!effectiveFilters.value) {
      return;
    }

    generate({
      filters: effectiveFilters.value,
    });
  }

  return {
    startValue,
    value,
    combineAdjacentPairs,
    session,
    tokenData,
    tokenPending,
    busy,
    copied,
    effectiveFilters,
    copyUrl,
    regenerateUrl,
    updateFilters,
  };
}
