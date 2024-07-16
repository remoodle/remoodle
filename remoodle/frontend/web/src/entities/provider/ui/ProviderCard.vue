<script setup lang="ts">
import { getURLHost } from "@/shared/utils";
import type { Provider } from "@/shared/types";
import { Link } from "@/shared/ui/link";
import { Label } from "@/shared/ui/label";
import { RadioGroupItem } from "@/shared/ui/radio-group";

defineProps<{
  id: string;
  provider: Provider;
}>();
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center space-x-2">
      <RadioGroupItem :id="id" :value="id" />
      <Label :for="id">
        {{ provider.name }}
      </Label>
    </div>
    <span class="mt-1 flex flex-col text-left text-sm">
      <template v-if="provider.description">
        {{ provider.description }}
      </template>
      <strong>
        {{ getURLHost(provider.api) }}
      </strong>
      <template v-if="provider.privacy">
        <Link underline hover :to="provider.privacy"> Privacy Policy </Link>
      </template>
      <!-- <template v-else>
        <span class="text-muted-foreground"> No privacy policy available </span>
      </template> -->
    </span>
  </div>
</template>
