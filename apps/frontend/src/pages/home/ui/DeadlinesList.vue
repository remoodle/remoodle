<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useQuery } from "@tanstack/vue-query";
import type { MoodleEvent } from "@remoodle/types";
import { Error } from "@/entities/page";
import { DeadlineCard } from "@/entities/deadline";
import { Skeleton } from "@/shared/ui/skeleton";
import { requestUnwrap, getAuthHeaders } from "@/shared/lib/hc";
import {
  isDefined,
  partition,
  objectEntries,
  fromUnix,
  formatDate,
} from "@/shared/lib/helpers";

const deadlines = ref<{
  [date: string]: MoodleEvent[] | undefined;
}>();

const { isPending, isError, data, error, refetch } = useQuery({
  queryKey: ["deadlines"],
  queryFn: async () =>
    await requestUnwrap((client) =>
      client.v2.deadlines.$get({ query: {} }, { headers: getAuthHeaders() }),
    ),
});

watchEffect(() => {
  if (!data.value) {
    return;
  }

  deadlines.value = partition(
    data.value,
    ({ timestart }) => `${formatDate(fromUnix(timestart), "fullDate")}`,
  );
});
</script>

<template>
  <template v-if="isPending">
    <div class="flex flex-col gap-2">
      <Skeleton v-for="i in 3" :key="i" class="h-16" />
    </div>
  </template>
  <template v-else-if="error || !isDefined(deadlines)">
    <Error @retry="refetch" />
  </template>
  <template v-else>
    <div class="flex flex-col gap-6">
      <div v-for="[date, list] in objectEntries(deadlines)" :key="date">
        <div class="mb-2 flex justify-between">
          <span class="text-sm font-medium text-muted-foreground">
            <span v-if="formatDate(Date.now(), 'fullDate') === date"> 🔥 </span>
            {{ date }}
          </span>
        </div>
        <div class="flex flex-col gap-2.5">
          <DeadlineCard
            v-for="deadline in list"
            :key="deadline.id"
            :deadline="deadline"
          />
        </div>
      </div>
    </div>
  </template>
</template>
