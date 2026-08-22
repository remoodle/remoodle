<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import { useUserProfileQuery, useSetPrimaryGroup, useGenerateRemoodleToken } from "@/lib/api/user";

const props = defineProps<{
  currentGroup: string;
}>();

const { data: profile, refetch: refetchProfile } = useUserProfileQuery();
const setPrimaryGroup = useSetPrimaryGroup();
const generateToken = useGenerateRemoodleToken();

const generatedCode = ref<string | null>(null);
const codeExpiry = ref<Date | null>(null);
const copied = ref(false);

const isPrimaryGroup = computed(
  () => !!props.currentGroup && profile.value?.primaryGroup === props.currentGroup,
);

async function handleSetPrimary() {
  if (!props.currentGroup) return;
  await setPrimaryGroup.mutateAsync(props.currentGroup);
  await refetchProfile();
}

async function handleGenerateCode() {
  generatedCode.value = null;
  const result = await generateToken.mutateAsync();
  generatedCode.value = result.token;
  codeExpiry.value = new Date(result.expiresAt);
}

async function copyCode() {
  if (!generatedCode.value) return;
  await navigator.clipboard.writeText(generatedCode.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Primary group -->
    <div v-if="currentGroup" class="flex flex-col gap-1">
      <p class="text-xs text-muted-foreground">
        My group
        <span v-if="profile?.primaryGroup" class="font-medium text-foreground">
          {{ profile.primaryGroup }}
        </span>
        <span v-else class="italic">not set</span>
      </p>
      <Button
        variant="outline"
        size="sm"
        class="w-full justify-start gap-2 text-xs"
        :disabled="isPrimaryGroup || setPrimaryGroup.isPending.value"
        @click="handleSetPrimary"
      >
        <Icon :icon="isPrimaryGroup ? 'lucide:check' : 'lucide:star'" class="size-3.5 shrink-0" />
        {{ isPrimaryGroup ? `${currentGroup} is your group` : `Set ${currentGroup} as my group` }}
      </Button>
    </div>

    <!-- Connect to ReMoodle -->
    <div class="flex flex-col gap-2">
      <p class="text-xs text-muted-foreground">Connect to @feathermoodbot</p>

      <template v-if="generatedCode">
        <div
          class="flex items-center justify-between rounded-md border border-dashed border-border bg-muted/50 px-3 py-2"
        >
          <span class="font-mono text-base font-semibold tracking-widest">
            {{ generatedCode }}
          </span>
          <button
            class="ml-2 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            @click="copyCode"
          >
            <Icon :icon="copied ? 'lucide:check' : 'lucide:copy'" class="size-4" />
          </button>
        </div>
        <p class="text-[11px] text-muted-foreground">
          Send this code to @feathermoodbot — valid for 10 min.
          <button
            class="underline underline-offset-2 hover:text-foreground"
            @click="handleGenerateCode"
          >
            Regenerate
          </button>
        </p>
      </template>

      <Button
        v-else
        variant="outline"
        size="sm"
        class="w-full justify-start gap-2 text-xs"
        :disabled="generateToken.isPending.value"
        @click="handleGenerateCode"
      >
        <Icon icon="lucide:link" class="size-3.5 shrink-0" />
        Generate code
      </Button>
    </div>
  </div>
</template>
