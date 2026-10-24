<script setup lang="ts">
import { computed, ref, watch } from "vue";
import MyDuConnectionDialog from "@/components/MyDuConnectionDialog.vue";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/api/client";
import {
  useMyDuActions,
  useMyDuSchedule,
  type MyDuConnectInput,
  type MyDuPeriodInput,
} from "@/lib/api/my-du";

const { data, isPending, error: loadError } = useMyDuSchedule();

const { start, connect, changePeriod, sync, disconnect } = useMyDuActions();

const dialog = ref<"connect" | "period" | null>(null);

const error = ref("");

const busy = computed(
  () =>
    start.isPending.value ||
    connect.isPending.value ||
    changePeriod.isPending.value ||
    sync.isPending.value ||
    disconnect.isPending.value,
);

const period = computed(() =>
  data.value?.connection
    ? { term: data.value.connection.term, firstWeekStart: data.value.connection.firstWeekStart }
    : undefined,
);

const dialogOpen = computed({
  get: () => dialog.value !== null,
  set: (open) => {
    if (!open) dialog.value = null;
  },
});

watch(dialog, () => {
  error.value = "";
});

async function act<Result>(action: () => Promise<Result>) {
  error.value = "";

  try {
    await action();

    return true;
  } catch (cause) {
    const fallback = "The request failed. Please try again.";

    error.value = cause instanceof Error ? apiErrorMessage(cause, fallback) : fallback;

    return false;
  }
}

async function openConnect() {
  dialog.value = "connect";
  await act(() => start.mutateAsync());
}

async function submitConnect(input: MyDuConnectInput) {
  if (await act(() => connect.mutateAsync(input))) dialog.value = null;
}

async function submitPeriod(input: MyDuPeriodInput) {
  if (await act(() => changePeriod.mutateAsync(input))) dialog.value = null;
}

function termLabel(term: number) {
  return term === -1 ? "Additional period 1" : `Term ${term}`;
}
</script>

<template>
  <section class="space-y-5" aria-labelledby="my-du-heading">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1.5">
        <h2 id="my-du-heading" class="text-base font-semibold">My DU schedule</h2>
        <p class="text-sm text-muted-foreground">
          Your university classes. Also available in the bot with /mydu.
        </p>
      </div>
      <Badge v-if="data?.connection" variant="secondary">{{
        data.connection.connected ? "Connected" : "Updates paused"
      }}</Badge>
    </div>
    <p v-if="isPending" role="status" class="text-sm text-muted-foreground">
      Loading your connection…
    </p>
    <p v-if="loadError" role="alert" class="text-sm text-destructive">
      Could not load your connection. Reload this page to try again.
    </p>
    <div v-if="data?.connection" class="space-y-3">
      <dl class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
        <div class="space-y-1">
          <dt class="text-muted-foreground">Period</dt>
          <dd>
            {{ data.connection.studyYear }}–{{ data.connection.studyYear + 1 }},
            {{ termLabel(data.connection.term) }}
          </dd>
        </div>
        <div class="space-y-1">
          <dt class="text-muted-foreground">Week 1 starts</dt>
          <dd>{{ data.connection.firstWeekStart }}</dd>
        </div>
        <div class="space-y-1">
          <dt class="text-muted-foreground">Saved classes</dt>
          <dd>{{ data.events.length }}</dd>
        </div>
        <div class="space-y-1">
          <dt class="text-muted-foreground">Last synced</dt>
          <dd>
            {{
              data.connection.lastSyncedAt
                ? new Date(data.connection.lastSyncedAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Never"
            }}
          </dd>
        </div>
      </dl>
      <p v-if="data.connection.syncError" role="alert" class="text-sm text-destructive">
        {{ data.connection.syncError }}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <template v-if="data?.connection?.connected">
        <Button variant="outline" :disabled="busy" @click="act(() => sync.mutateAsync())">{{
          sync.isPending.value ? "Syncing…" : "Sync now"
        }}</Button>
        <Button variant="outline" :disabled="busy" @click="dialog = 'period'">Change period</Button>
        <AlertDialog>
          <AlertDialogTrigger as-child
            ><Button variant="ghost" :disabled="busy" class="text-muted-foreground"
              >Disconnect</Button
            ></AlertDialogTrigger
          >
          <AlertDialogContent>
            <AlertDialogHeader
              ><AlertDialogTitle>Disconnect My DU?</AlertDialogTitle
              ><AlertDialogDescription
                >Automatic updates stop and your login is deleted. Saved classes
                stay.</AlertDialogDescription
              ></AlertDialogHeader
            >
            <AlertDialogFooter
              ><AlertDialogCancel>Keep connected</AlertDialogCancel
              ><AlertDialogAction @click="act(() => disconnect.mutateAsync())"
                >Disconnect</AlertDialogAction
              ></AlertDialogFooter
            >
          </AlertDialogContent>
        </AlertDialog>
      </template>
      <Button v-else :disabled="busy || isPending || !!loadError" @click="openConnect">{{
        data?.connection ? "Reconnect My DU" : "Connect My DU"
      }}</Button>
    </div>
    <p v-if="error && !dialog" role="alert" class="text-sm text-destructive">{{ error }}</p>
    <MyDuConnectionDialog
      v-model:open="dialogOpen"
      :mode="dialog ?? 'connect'"
      :period="period"
      :sign-in-url="start.data.value?.url"
      :busy="busy"
      :error="error"
      @restart="act(() => start.mutateAsync())"
      @connect="submitConnect"
      @change-period="submitPeriod"
    />
  </section>
</template>
