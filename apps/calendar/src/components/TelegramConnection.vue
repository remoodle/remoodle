<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { Button } from "@/components/ui/button";
import { useGenerateRemoodleToken } from "@/lib/api/user";

const generateToken = useGenerateRemoodleToken();

const generatedCode = ref<string | null>(null);

const copied = ref(false);

const error = ref("");

async function generateCode() {
  error.value = "";

  try {
    const result = await generateToken.mutateAsync();
    generatedCode.value = result.token;
    copied.value = false;
  } catch {
    error.value = "Could not generate a code. Please try again.";
  }
}

async function copyCode() {
  if (!generatedCode.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(generatedCode.value);
    copied.value = true;
  } catch {
    error.value = "Could not copy the code. Select it and copy it manually.";
  }
}
</script>

<template>
  <section class="space-y-5 py-8" aria-labelledby="telegram-heading">
    <div class="space-y-1.5">
      <h2 id="telegram-heading" class="text-base font-semibold">Telegram</h2>
      <p class="text-sm text-muted-foreground">
        Use your personal schedule in ReMoodle. Generate a code, then send it to
        <a
          href="https://t.me/feathermoodbot"
          target="_blank"
          rel="noopener noreferrer"
          class="text-foreground underline underline-offset-4"
          >@feathermoodbot</a
        >.
      </p>
    </div>
    <template v-if="generatedCode">
      <div class="flex max-w-sm items-center justify-between gap-3 rounded-lg border px-4 py-3">
        <code class="select-all break-all text-lg font-semibold tracking-widest">{{
          generatedCode
        }}</code>
        <Button variant="ghost" size="sm" @click="copyCode"
          ><Icon :icon="copied ? 'lucide:check' : 'lucide:copy'" class="size-4" />{{
            copied ? "Copied" : "Copy"
          }}</Button
        >
      </div>
      <p class="text-xs text-muted-foreground" role="status">
        Send this code within 10 minutes. Keep it private.
      </p>
    </template>
    <Button variant="outline" :disabled="generateToken.isPending.value" @click="generateCode">{{
      generateToken.isPending.value
        ? "Generating…"
        : generatedCode
          ? "Generate new code"
          : "Generate connection code"
    }}</Button>
    <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
  </section>
</template>
