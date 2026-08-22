<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIcalTokenQuery, useUpsertIcalToken, useUpdateIcalFilters } from "@/lib/api/ical";
import type { ScheduleFilter } from "@/lib/types";

const props = defineProps<{ group: string; filters: ScheduleFilter }>();

const open = ref(false);
const copied = ref(false);

const { data: tokenData, isPending } = useIcalTokenQuery(() => props.group);
const { mutate: generate, isPending: generating } = useUpsertIcalToken();
const { mutate: updateFilters, isPending: updatingFilters } = useUpdateIcalFilters();

const busy = () => generating.value || updatingFilters.value;

async function copy() {
  if (!tokenData.value?.url) return;
  await navigator.clipboard.writeText(tokenData.value.url);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="max-w-80 rounded-2xl md:max-w-sm">
      <DialogHeader>
        <DialogTitle class="text-left text-xl font-bold">iCal Subscription</DialogTitle>
        <DialogDescription class="text-left">
          Paste this URL into Google Calendar, Apple Calendar, or any app that supports calendar
          subscriptions. It stays in sync automatically.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3">
        <div class="text-sm font-medium">{{ group }}</div>

        <template v-if="isPending || busy()">
          <div class="flex h-8 items-center justify-center rounded-md border border-input bg-muted">
            <span class="text-xs text-muted-foreground">Loading...</span>
          </div>
        </template>
        <template v-else-if="tokenData?.url">
          <div class="flex gap-2">
            <input
              :value="tokenData.url"
              readonly
              class="flex h-8 min-w-0 flex-1 rounded-md border border-input bg-muted px-3 py-2 text-xs text-muted-foreground ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              @click="($event.target as HTMLInputElement).select()"
            />
            <Button variant="outline" size="sm" class="shrink-0" @click="copy">
              {{ copied ? "Copied!" : "Copy" }}
            </Button>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-xs text-muted-foreground">Sync your current filters to this URL.</p>
            <Button
              variant="ghost"
              size="sm"
              class="shrink-0 text-muted-foreground"
              :disabled="busy()"
              @click="updateFilters({ group, filters })"
            >
              Update filters
            </Button>
          </div>
        </template>
        <template v-else>
          <Button variant="outline" :disabled="busy()" @click="generate({ group, filters })">
            Generate link
          </Button>
          <p class="text-xs text-muted-foreground">
            Generates a subscription URL with your current filters.
          </p>
        </template>
      </div>
    </DialogContent>
  </Dialog>
</template>
