<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Badge } from "@/components/ui/badge";
import MyDuConnectionDialog from "@/components/MyDuConnectionDialog.vue";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMyDuActions, useMyDuSchedule, type MyDuConnectionInput } from "@/lib/api/my-du";

const { data, isPending, error: loadError } = useMyDuSchedule();
const { start, connect, sync, disconnect } = useMyDuActions();
const editing = ref(false);
const error = ref("");
const busy = computed(
  () =>
    start.isPending.value ||
    connect.isPending.value ||
    sync.isPending.value ||
    disconnect.isPending.value,
);

async function act(action: () => Promise<unknown>) {
  error.value = "";
  try {
    await action();
  } catch (e) {
    const detail = e && typeof e === "object" && "detail" in e ? e.detail : null;
    const cause = detail && typeof detail === "object" && "data" in detail ? detail.data : null;
    error.value =
      cause && typeof cause === "object" && "message" in cause && typeof cause.message === "string"
        ? cause.message
        : "The request failed. Please try again.";
  }
}

watch(editing, (open) => {
  if (!open) {
    start.reset();
    error.value = "";
  }
});

async function prepare() {
  await act(async () => {
    await start.mutateAsync();
    editing.value = true;
  });
}

async function submit(payload: MyDuConnectionInput) {
  await act(async () => {
    await connect.mutateAsync(payload);
    editing.value = false;
    start.reset();
  });
}
</script>

<template>
  <section class="space-y-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1.5">
        <h2 class="text-base font-semibold">My DU schedule</h2>
        <p class="text-sm text-muted-foreground">
          Your university classes, synced to your calendar.
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
    <div v-if="data?.connection" class="space-y-4">
      <dl class="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg bg-muted/40 p-4 text-sm">
        <div class="space-y-1">
          <dt class="text-muted-foreground">Academic year</dt>
          <dd>{{ data.connection.studyYear }}–{{ data.connection.studyYear + 1 }}</dd>
        </div>
        <div class="space-y-1">
          <dt class="text-muted-foreground">Period</dt>
          <dd>{{ data.connection.term === -1 ? "Additional period 1" : data.connection.term }}</dd>
        </div>
        <div class="space-y-1">
          <dt class="text-muted-foreground">Saved classes</dt>
          <dd>{{ data.events.length }}</dd>
        </div>
        <div class="space-y-1">
          <dt class="text-muted-foreground">Week 1 starts</dt>
          <dd>{{ data.connection.firstWeekStart }}</dd>
        </div>
      </dl>
      <p class="text-xs text-muted-foreground">
        <template v-if="data.connection.lastSyncedAt"
          >Last synced
          {{
            new Date(data.connection.lastSyncedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })
          }}.</template
        >
        {{
          data.connection.connected
            ? "Syncs daily."
            : "Your saved classes are still available. Reconnect to resume updates."
        }}
      </p>
      <p v-if="data.connection.syncError" role="alert" class="text-sm text-destructive">
        {{ data.connection.syncError }}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button
        v-if="data?.connection?.connected"
        variant="outline"
        :disabled="busy"
        @click="act(() => sync.mutateAsync())"
        >{{ sync.isPending.value ? "Syncing…" : "Sync now" }}</Button
      >
      <Button
        :variant="data?.connection?.connected ? 'outline' : 'default'"
        :disabled="busy || isPending || !!loadError"
        @click="prepare"
        >{{
          start.isPending.value
            ? "Preparing…"
            : data?.connection?.connected
              ? "Change connection"
              : data?.connection
                ? "Reconnect My DU"
                : "Connect My DU"
        }}</Button
      >
      <AlertDialog v-if="data?.connection?.connected">
        <AlertDialogTrigger as-child
          ><Button variant="ghost" :disabled="busy" class="text-muted-foreground"
            >Disconnect</Button
          ></AlertDialogTrigger
        >
        <AlertDialogContent>
          <AlertDialogHeader
            ><AlertDialogTitle>Disconnect My DU?</AlertDialogTitle
            ><AlertDialogDescription
              >Automatic updates will stop and your connection credentials will be deleted. Your
              saved classes will stay in your calendar.</AlertDialogDescription
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
    </div>
    <MyDuConnectionDialog
      v-model:open="editing"
      :connection="data?.connection"
      :sign-in-url="start.data.value?.url"
      :busy="busy"
      :connecting="connect.isPending.value"
      :error="error"
      @restart="prepare"
      @submit="submit"
    />
    <p v-if="error && !editing" role="alert" class="text-sm text-destructive">{{ error }}</p>
  </section>
</template>
