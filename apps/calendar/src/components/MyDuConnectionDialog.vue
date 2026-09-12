<script setup lang="ts">
import { shallowRef, watch } from "vue";
import type { MyDuConnectionInput } from "@/lib/api/my-du";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  Dialog,
  DialogScrollContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const props = defineProps<{
  connection?: Omit<MyDuConnectionInput, "callbackUrl"> | null;
  signInUrl?: string;
  busy: boolean;
  connecting: boolean;
  error: string;
}>();

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{ submit: [value: MyDuConnectionInput]; restart: [] }>();

const callbackUrl = shallowRef("");

const academicYear = shallowRef(new Date().getFullYear());

const term = shallowRef(1);

const firstWeekStart = shallowRef("");

watch(open, (isOpen) => {
  callbackUrl.value = "";

  if (isOpen && props.connection) {
    academicYear.value = props.connection.studyYear;
    term.value = props.connection.term;
    firstWeekStart.value = props.connection.firstWeekStart;
  }
});

watch(
  () => props.signInUrl,
  () => {
    callbackUrl.value = "";
  },
);

function submit() {
  const payload = {
    callbackUrl: callbackUrl.value,
    studyYear: academicYear.value,
    term: term.value,
    firstWeekStart: firstWeekStart.value,
  };

  callbackUrl.value = "";
  emit("submit", payload);
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogScrollContent>
      <DialogHeader>
        <DialogTitle>{{ connection ? "Update My DU connection" : "Connect My DU" }}</DialogTitle>
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
          <Button v-if="signInUrl" as-child variant="outline"
            ><a :href="signInUrl" target="_blank" rel="noopener noreferrer"
              >Sign in to My DU</a
            ></Button
          >
          <Button type="button" variant="ghost" :disabled="busy" @click="emit('restart')"
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
        <p v-if="connection" class="text-xs text-muted-foreground">
          Connecting again replaces the saved timetable with the selected account and term.
        </p>
        <Button type="submit" :disabled="busy">{{
          connecting ? "Importing your classes…" : "Connect and import schedule"
        }}</Button>
        <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
