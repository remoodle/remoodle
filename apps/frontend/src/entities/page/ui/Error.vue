<script setup lang="ts">
import { Icon } from "@/shared/ui/icon";
import { Link } from "@/shared/ui/link";
import { Button } from "@/shared/ui/button";
import { org } from "@/shared/config";

withDefaults(
  defineProps<{
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);

const emit = defineEmits(["retry"]);
</script>

<template>
  <div class="flex w-fit flex-row gap-2 pr-4">
    <Icon name="error" class="h-9 w-9 flex-none" />
    <div class="flex flex-col gap-2">
      <div class="flex flex-col" v-if="!compact">
        <span class="text-lg font-bold leading-6"> An error occurred </span>
        <p class="text-base-content/80 text-sm">
          Try again or
          <Link :to="org.telegram" underline hover> contact us </Link>
        </p>
      </div>
      <Button class="w-fit px-4" @click="emit('retry')"> Try again </Button>
    </div>
  </div>
</template>
