<script setup lang="ts">
import { shallowRef, watch } from "vue";
import type { MyDuConnectInput, MyDuPeriodInput } from "@/lib/api/my-du";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from "@/components/ui/dialog";

// "connect" signs in to My DU again; "period" only switches the imported period.
const props = defineProps<{
  mode: "connect" | "period";
  period?: MyDuPeriodInput;
  signInUrl?: string;
  busy: boolean;
  error: string;
}>();

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{
  connect: [value: MyDuConnectInput];
  changePeriod: [value: MyDuPeriodInput];
  restart: [];
}>();

const terms = [
  { value: 1, label: "Term 1" },
  { value: 2, label: "Term 2" },
  { value: 3, label: "Term 3" },
  { value: -1, label: "Additional period 1" },
] as const;

const callbackUrl = shallowRef("");

const term = shallowRef<MyDuPeriodInput["term"]>(1);

const firstWeekStart = shallowRef("");

// A new sign-in request makes any pasted address stale.
watch(
  () => props.signInUrl,
  () => {
    callbackUrl.value = "";
  },
);

watch(open, (isOpen) => {
  callbackUrl.value = "";

  if (isOpen && props.period) {
    term.value = props.period.term;
    firstWeekStart.value = props.period.firstWeekStart;
  }
});

function submit() {
  const period = { term: term.value, firstWeekStart: firstWeekStart.value };

  if (props.mode === "period") {
    emit("changePeriod", period);

    return;
  }

  // Kept after submitting: if My DU was unreachable, the same link can be sent again.
  emit("connect", { ...period, callbackUrl: callbackUrl.value });
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogScrollContent>
      <DialogHeader>
        <DialogTitle>{{ mode === "period" ? "Change period" : "Connect My DU" }}</DialogTitle>
        <DialogDescription>{{
          mode === "period"
            ? "Import classes for another academic period. Your login stays connected."
            : "Sign in with your university Microsoft account, then paste the final address here."
        }}</DialogDescription>
      </DialogHeader>
      <form class="space-y-6" @submit.prevent="submit">
        <FieldGroup>
          <template v-if="mode === 'connect'">
            <Field>
              <FieldLabel>1. Sign in to My DU</FieldLabel>
              <FieldDescription
                >My DU may open as a blank page. Copy its full address and paste it below within a
                few minutes.</FieldDescription
              >
              <div class="flex flex-wrap gap-2">
                <Button v-if="signInUrl" as-child variant="outline"
                  ><a :href="signInUrl" target="_blank" rel="noopener noreferrer"
                    >Sign in with Microsoft</a
                  ></Button
                >
                <Button type="button" variant="ghost" :disabled="busy" @click="emit('restart')"
                  >Start again</Button
                >
              </div>
            </Field>
            <Field>
              <FieldLabel for="my-du-link">2. Paste the My DU address</FieldLabel>
              <Input
                id="my-du-link"
                v-model="callbackUrl"
                type="password"
                autocomplete="off"
                :spellcheck="false"
                required
                maxlength="20000"
                placeholder="https://my-du.astanait.edu.kz/login#code=…"
              />
              <FieldDescription
                >The address holds a one-time login code. Your password never reaches
                ReMoodle.</FieldDescription
              >
            </Field>
          </template>
          <Field>
            <FieldLabel for="my-du-term">Academic period</FieldLabel>
            <select
              id="my-du-term"
              v-model="term"
              class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option v-for="option in terms" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </Field>
          <Field>
            <FieldLabel for="my-du-week">Monday of teaching week 1</FieldLabel>
            <Input id="my-du-week" v-model="firstWeekStart" type="date" required />
            <FieldDescription
              >My DU only gives week numbers, so this date from your academic calendar puts each
              class on the right day.</FieldDescription
            >
          </Field>
        </FieldGroup>
        <Button type="submit" :disabled="busy">{{
          busy ? "Importing your classes…" : mode === "period" ? "Change period" : "Connect"
        }}</Button>
        <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
