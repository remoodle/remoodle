<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { client, parseResponse } from "@/lib/api/client";
import { sessionQuery } from "@/lib/api/session";

const open = ref(false);

const queryClient = useQueryClient();

// Signing in only refreshes the session query; pages decide where to go next.
// The request is created when the dialog opens, so the Telegram link is a real anchor
// and opens synchronously on click instead of being caught by popup blockers.
const start = useMutation({
  mutationFn: () => parseResponse(client.api.auth.telegram.$post()),
});

const poll = useQuery({
  queryKey: ["telegram-sign-in", () => start.data.value?.pollSecret],
  enabled: () => open.value && !!start.data.value,
  queryFn: () =>
    parseResponse(
      client.api.auth.telegram.poll.$post({ json: { pollSecret: start.data.value!.pollSecret } }),
    ),
  refetchInterval: (query) => (query.state.data?.status === "pending" ? 2000 : false),
  refetchIntervalInBackground: true,
  gcTime: 0,
});

watch(open, (isOpen) => {
  if (isOpen) {
    start.mutate();
  } else {
    start.reset();
  }
});

watch(
  () => poll.data.value?.status,
  async (status) => {
    if (status === "approved") {
      open.value = false;
      await queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey });
    }
  },
);
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="max-w-80 rounded-2xl md:max-w-sm">
      <DialogHeader class="space-y-1.5">
        <DialogTitle class="text-left text-base">Sign in with Telegram</DialogTitle>
        <DialogDescription class="text-left">
          Confirm the sign-in in the ReMoodle bot, then come back to this tab.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-3 pt-1">
        <Button v-if="start.data.value && poll.data.value?.status !== 'expired'" as-child>
          <a :href="start.data.value.url" target="_blank" rel="noopener noreferrer">
            <Icon icon="mdi:telegram" class="size-5" />
            Continue with Telegram
          </a>
        </Button>
        <Button v-else-if="poll.data.value?.status === 'expired'" @click="start.mutate()">
          Start again
        </Button>
        <Button v-else disabled>Preparing…</Button>
        <p
          v-if="poll.data.value?.status === 'pending'"
          role="status"
          class="text-sm text-muted-foreground"
        >
          Waiting for confirmation in Telegram…
        </p>
        <p
          v-if="poll.data.value?.status === 'expired'"
          role="alert"
          class="text-sm text-muted-foreground"
        >
          This sign-in link expired.
        </p>
        <p
          v-if="start.error.value || poll.error.value"
          role="alert"
          class="text-sm text-destructive"
        >
          Could not reach ReMoodle. Try again.
        </p>
      </div>
    </DialogContent>
  </Dialog>
</template>
