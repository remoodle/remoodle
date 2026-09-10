<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

defineProps<{
  url?: string;
  tokenPending: boolean;
  busy: boolean;
  copied: boolean;
  canUpdate: boolean;
}>();

const emit = defineEmits<{ copy: []; generate: []; updateFilters: [] }>();
</script>

<template>
  <div class="flex flex-col gap-3 rounded-xl border p-4">
    <div>
      <p class="text-sm font-medium">iCal subscription</p>
      <p class="mt-0.5 text-xs text-muted-foreground">
        Paste this URL into Google Calendar, Apple Calendar, or any app that supports calendar
        subscriptions.
      </p>
    </div>

    <template v-if="tokenPending || busy">
      <div class="flex h-8 items-center justify-center rounded-md border border-input bg-muted">
        <span class="text-xs text-muted-foreground">Loading...</span>
      </div>
    </template>
    <template v-else-if="url">
      <div class="flex gap-2">
        <Input
          :model-value="url"
          readonly
          class="flex h-8 min-w-0 flex-1 rounded-md border border-input bg-muted px-3 py-2 text-xs text-muted-foreground ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          @click="($event.target as HTMLInputElement).select()"
        />
        <Button variant="outline" size="sm" class="shrink-0" @click="emit('copy')">
          {{ copied ? "Copied!" : "Copy" }}
        </Button>
      </div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button
                variant="ghost"
                size="sm"
                class="shrink-0 text-muted-foreground"
                :disabled="busy || !canUpdate"
              >
                Regenerate URL
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerate subscription URL?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will create a new subscription link for your schedule. Re-add the new URL in
                  Google Calendar if you are replacing an old cached subscription.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction @click="emit('generate')"> Regenerate </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="ghost"
            size="sm"
            class="shrink-0 text-muted-foreground"
            :disabled="busy || !canUpdate"
            @click="emit('updateFilters')"
          >
            Update filters
          </Button>
        </div>
      </div>
    </template>
    <template v-else>
      <Button variant="outline" :disabled="busy || !canUpdate" @click="emit('generate')">
        Generate link
      </Button>
      <p class="text-xs text-muted-foreground">
        Generates a subscription URL with your current filters.
      </p>
    </template>
  </div>
</template>
