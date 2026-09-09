<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Dialog,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useMoodleSchedule, useMoodleActions } from "@/lib/api/moodle";

const { data, isPending, isFetching, error: loadError, refetch } = useMoodleSchedule();
const { connect, disconnect } = useMoodleActions();
const open = ref(false);
const url = ref("");
const error = ref("");
const busy = computed(
  () => connect.isPending.value || isFetching.value || disconnect.isPending.value,
);
watch(open, () => {
  url.value = "";
  error.value = "";
});
async function act(action: () => Promise<unknown>) {
  error.value = "";
  try {
    await action();
    return true;
  } catch {
    error.value = "Could not update the Moodle connection. Check your calendar URL and try again.";
    return false;
  }
}
async function submit() {
  const link = url.value;
  if (
    await act(async () => {
      await connect.mutateAsync(link);
    })
  ) {
    open.value = false;
    url.value = "";
  }
}
</script>

<template>
  <section class="space-y-5 py-8" aria-labelledby="moodle-heading">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1.5">
        <h2 id="moodle-heading" class="text-base font-semibold">Moodle calendar</h2>
        <p class="text-sm text-muted-foreground">
          Assignments, quizzes, and other course events alongside your classes.
        </p>
      </div>
      <Badge v-if="data?.connection" variant="secondary">Connected</Badge>
    </div>
    <p v-if="isPending" role="status" class="text-sm text-muted-foreground">
      Loading your connection…
    </p>
    <div v-if="loadError" class="space-y-2">
      <p role="alert" class="text-sm text-destructive">Could not load your Moodle connection.</p>
      <Button variant="outline" @click="refetch()">Try again</Button>
    </div>
    <template v-if="!isPending">
      <div v-if="data?.connection" class="space-y-2 text-sm">
        <p>{{ data.events.length }} events loaded</p>
        <p class="text-xs text-muted-foreground">
          <template v-if="data.fetchedAt"
            >Last fetched
            {{
              new Date(data.fetchedAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })
            }}.</template
          >
          Loads when you open the calendar. Only dates included in your Moodle export are available.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button v-if="data?.connection" variant="outline" :disabled="busy" @click="refetch()">{{
          isFetching ? "Refreshing…" : "Refresh"
        }}</Button>
        <Button variant="outline" :disabled="busy" @click="open = true">{{
          data?.connection ? "Replace calendar URL" : "Connect Moodle"
        }}</Button>
        <AlertDialog v-if="data?.connection">
          <AlertDialogTrigger as-child
            ><Button variant="ghost" :disabled="busy" class="text-muted-foreground"
              >Disconnect</Button
            ></AlertDialogTrigger
          >
          <AlertDialogContent>
            <AlertDialogHeader
              ><AlertDialogTitle>Disconnect Moodle?</AlertDialogTitle
              ><AlertDialogDescription
                >This removes your Moodle connection and stops future Moodle updates and reminders
                in the linked bot.</AlertDialogDescription
              ></AlertDialogHeader
            >
            <AlertDialogFooter
              ><AlertDialogCancel>Cancel</AlertDialogCancel
              ><AlertDialogAction @click="act(() => disconnect.mutateAsync())"
                >Disconnect</AlertDialogAction
              ></AlertDialogFooter
            >
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </template>
    <p v-if="error && !open" role="alert" class="text-sm text-destructive">{{ error }}</p>
    <Dialog v-model:open="open">
      <DialogScrollContent>
        <DialogHeader
          ><DialogTitle>Connect Moodle calendar</DialogTitle
          ><DialogDescription
            >Use a private calendar export URL. No Moodle password needed.</DialogDescription
          ></DialogHeader
        >
        <ol class="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Open
            <a
              href="https://lms.astanait.edu.kz/calendar/export.php"
              target="_blank"
              rel="noopener noreferrer"
              class="text-foreground underline underline-offset-4"
              >Moodle calendar export</a
            >.
          </li>
          <li>
            Choose <span class="font-medium text-foreground">All events</span> and
            <span class="font-medium text-foreground">Custom range</span>. Cover your academic year
            if you want to browse every week.
          </li>
          <li>
            Click <span class="font-medium text-foreground">Get calendar URL</span>, then copy and
            paste it below.
          </li>
        </ol>
        <form class="space-y-5" @submit.prevent="submit">
          <Field>
            <FieldLabel for="moodle-url">Calendar URL</FieldLabel>
            <Input
              id="moodle-url"
              v-model="url"
              type="password"
              autocomplete="off"
              :spellcheck="false"
              maxlength="4096"
              required
              placeholder="Paste your Moodle calendar URL"
            />
            <FieldDescription
              >The URL grants access to your calendar. We store it encrypted and never show it to
              other users.</FieldDescription
            >
          </Field>
          <p v-if="data?.connection" class="text-xs text-muted-foreground">
            This replaces your current Moodle calendar after the new one loads successfully.
          </p>
          <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
          <DialogFooter
            ><Button type="submit" :disabled="busy">{{
              connect.isPending.value ? "Connecting…" : "Connect Moodle"
            }}</Button></DialogFooter
          >
        </form>
      </DialogScrollContent>
    </Dialog>
  </section>
</template>
