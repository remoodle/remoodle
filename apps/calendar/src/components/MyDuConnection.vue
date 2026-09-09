<script setup lang="ts">
import { computed, ref, watch } from "vue";
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
    if (connection) {
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
  <section class="mx-auto w-full max-w-xl space-y-5 p-5 sm:p-6">
    <div class="space-y-2">
      <h1 class="text-lg font-semibold">My DU schedule</h1>
      <p class="text-sm text-muted-foreground">
        Connect your university account to import your personal classes.
      </p>
    </div>
    <p v-if="isPending" role="status" class="text-sm text-muted-foreground">
      Loading your connection…
    </p>
    <p v-if="loadError" role="alert" class="text-sm text-destructive">
      Could not load your connection. Reload this page to try again.
    </p>
    <div v-if="data?.connection" class="space-y-3 border-b pb-5 text-sm">
      <p>
        {{ data.connection.connected ? "My DU connected" : "My DU disconnected" }} ·
        {{ data.events.length }} saved classes
      </p>
      <p class="text-muted-foreground">
        {{ data.connection.studyYear }}–{{ data.connection.studyYear + 1 }}, period
        {{ data.connection.term }}. Week 1 starts {{ data.connection.firstWeekStart }}.
      </p>
      <p v-if="data.connection.lastSyncedAt" class="text-muted-foreground">
        Last synced {{ new Date(data.connection.lastSyncedAt).toLocaleString() }}. Connected
        schedules refresh periodically.
      </p>
      <p v-if="data.connection.syncError" role="alert" class="text-destructive">
        {{ data.connection.syncError }}
      </p>
      <div v-if="data.connection.connected" class="flex flex-wrap gap-2">
        <Button variant="outline" :disabled="busy" @click="act(() => sync.mutateAsync())">{{
          sync.isPending.value ? "Syncing…" : "Sync now"
        }}</Button>
        <Button variant="ghost" :disabled="busy" @click="act(() => disconnect.mutateAsync())"
          >Disconnect My DU</Button
        >
      </div>
      <p class="text-xs text-muted-foreground">
        Disconnecting stops updates and deletes connection credentials. Saved classes remain in your
        calendar.
      </p>
    </div>
    <template v-if="!editing">
      <Button :disabled="busy || isPending || !!loadError" @click="prepare">{{
        start.isPending.value
          ? "Preparing…"
          : data?.connection?.connected
            ? "Reconnect or change term"
            : "Connect My DU"
      }}</Button>
    </template>
    <form v-else class="space-y-6" @submit.prevent="submit">
      <div class="space-y-3">
        <h2 class="text-sm font-medium">1. Sign in with your university account</h2>
        <p class="text-sm text-muted-foreground">
          Use the link below. After Microsoft returns you to My DU, the page may be blank. Copy its
          full address, return here, and paste it promptly.
        </p>
        <Button v-if="start.data.value" as-child variant="outline"
          ><a :href="start.data.value.url" target="_blank" rel="noopener noreferrer"
            >Sign in to My DU</a
          ></Button
        >
        <Button type="button" variant="ghost" :disabled="busy" @click="prepare">Start again</Button>
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
            >This link connects the Microsoft account you just used. We never ask for your Microsoft
            password.</FieldDescription
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
            >Use your academic calendar to confirm this date. My DU provides week numbers; this date
            places each class on the correct day.</FieldDescription
          >
        </Field>
      </FieldGroup>
      <p v-if="data?.connection" class="text-xs text-muted-foreground">
        Connecting again replaces the saved timetable with the selected account and term.
      </p>
      <Button type="submit" :disabled="busy">{{
        connect.isPending.value ? "Importing your classes…" : "Connect and import schedule"
      }}</Button>
    </form>
    <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
  </section>
</template>
