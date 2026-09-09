<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldGroup } from "@/components/ui/field";
import { useMyDuActions, useMyDuSchedule } from "@/lib/api/my-du";

const { data, isPending, error: loadError } = useMyDuSchedule();
const { start, connect, sync, disconnect } = useMyDuActions();
const editing = ref(false);
const callbackUrl = ref("");
const academicYear = ref(new Date().getFullYear());
const term = ref(1);
const firstWeekStart = ref("");
const error = ref("");
const busy = computed(
  () =>
    start.isPending.value ||
    connect.isPending.value ||
    sync.isPending.value ||
    disconnect.isPending.value,
);
watch(
  () => data.value?.connection,
  (connection) => {
    if (connection && !editing.value) {
      academicYear.value = connection.studyYear;
      term.value = connection.term;
      firstWeekStart.value = connection.firstWeekStart;
    }
  },
  { immediate: true },
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
    callbackUrl.value = "";
    start.reset();
    error.value = "";
  }
});

async function prepare() {
  await act(async () => {
    await start.mutateAsync();
    editing.value = true;
    callbackUrl.value = "";
  });
}
async function submit() {
  const link = callbackUrl.value;
  callbackUrl.value = "";
  await act(async () => {
    await connect.mutateAsync({
      callbackUrl: link,
      studyYear: academicYear.value,
      term: term.value,
      firstWeekStart: firstWeekStart.value,
    });
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
            ? "Updates automatically."
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
    <Dialog v-model:open="editing">
      <DialogScrollContent>
        <DialogHeader>
          <DialogTitle>{{
            data?.connection ? "Update My DU connection" : "Connect My DU"
          }}</DialogTitle>
          <DialogDescription
            >Sign in with Microsoft, then bring the connection link back here.</DialogDescription
          >
        </DialogHeader>
        <form class="space-y-6" @submit.prevent="submit">
          <div class="space-y-3">
            <h3 class="text-sm font-medium">1. Sign in to My DU</h3>
            <p class="text-sm text-muted-foreground">
              Use the link below. After Microsoft returns you to My DU, the page may be blank. Copy
              its full address, return here, and paste it promptly.
            </p>
            <Button v-if="start.data.value" as-child variant="outline"
              ><a :href="start.data.value.url" target="_blank" rel="noopener noreferrer"
                >Sign in to My DU</a
              ></Button
            >
            <Button type="button" variant="ghost" :disabled="busy" @click="prepare"
              >Start again</Button
            >
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel for="my-du-link">2. Paste the connection link</FieldLabel>
              <Input
                id="my-du-link"
                v-model="callbackUrl"
                type="password"
                autocomplete="off"
                :spellcheck="false"
                required
                maxlength="20000"
                placeholder="Paste the full My DU address"
              />
              <FieldDescription
                >This link connects the Microsoft account you just used. We never ask for your
                Microsoft password.</FieldDescription
              >
            </Field>
            <div class="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel for="my-du-year">Academic year starts in</FieldLabel>
                <Input
                  id="my-du-year"
                  v-model="academicYear"
                  type="number"
                  min="2020"
                  max="2100"
                  required
                />
              </Field>
              <Field>
                <FieldLabel for="my-du-term">Academic period</FieldLabel>
                <select
                  id="my-du-term"
                  v-model="term"
                  class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option :value="1">1</option>
                  <option :value="2">2</option>
                  <option :value="3">3</option>
                  <option :value="-1">Additional period 1</option>
                </select>
              </Field>
            </div>
            <Field>
              <FieldLabel for="my-du-week">Monday of teaching week 1</FieldLabel>
              <Input id="my-du-week" v-model="firstWeekStart" type="date" required />
              <FieldDescription
                >Use your academic calendar to confirm this date. My DU provides week numbers; this
                date places each class on the correct day.</FieldDescription
              >
            </Field>
          </FieldGroup>
          <p v-if="data?.connection" class="text-xs text-muted-foreground">
            Connecting again replaces the saved timetable with the selected account and term.
          </p>
          <Button type="submit" :disabled="busy">{{
            connect.isPending.value ? "Importing your classes…" : "Connect and import schedule"
          }}</Button>
          <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
        </form>
      </DialogScrollContent>
    </Dialog>
    <p v-if="error && !editing" role="alert" class="text-sm text-destructive">{{ error }}</p>
  </section>
</template>
