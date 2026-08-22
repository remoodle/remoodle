<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useMutation } from "@tanstack/vue-query";
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";

const props = withDefaults(defineProps<{ callbackURL?: string }>(), {
  callbackURL: "/schedule",
});

const open = ref(false);

const {
  mutate: signInWithMicrosoft,
  isPending,
  error,
} = useMutation({
  mutationFn: () =>
    authClient.signIn
      .social({ provider: "microsoft", callbackURL: props.callbackURL })
      .then(({ error }) => {
        if (error) throw new Error(error.message ?? "Sign in failed");
      }),
});
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot />
    </DialogTrigger>
    <DialogContent class="max-w-80 rounded-2xl md:max-w-sm">
      <DialogHeader class="space-y-0">
        <DialogTitle class="text-left text-base font-medium text-muted-foreground">
          Use your @astanait.edu.kz account
        </DialogTitle>
      </DialogHeader>

      <div class="flex flex-col gap-3 pt-1">
        <Button variant="outline" :disabled="isPending" @click="() => signInWithMicrosoft()">
          <Icon icon="mdi:microsoft" class="mr-2 h-5 w-5" />
          {{ isPending ? "Redirecting..." : "Continue with Microsoft" }}
        </Button>
        <p v-if="error" class="text-sm text-destructive">
          {{ (error as Error).message }}
        </p>
      </div>
    </DialogContent>
  </Dialog>
</template>
