<script setup lang="ts">
import { useMagicKeys } from "@vueuse/core";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/ui/command";
import { Icon } from "@/shared/ui/icon";

import { ref, watch } from "vue";

const open = ref(false);

const { Meta_K, Ctrl_K } = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
    }
  },
});

watch([Meta_K, Ctrl_K], (v) => {
  if (v[0] || v[1]) {
    handleOpenChange();
  }
});

function handleOpenChange() {
  open.value = !open.value;
}
</script>

<template>
  <button
    class="group relative w-1/2 max-w-sm cursor-pointer items-center text-start sm:w-1/2 xl:w-full"
    @click="handleOpenChange"
  >
    <div
      class="rounded-md border-none bg-muted px-3 py-2 pl-10 text-sm text-muted-foreground"
    >
      Search
    </div>
    <span
      class="absolute inset-y-0 start-0 flex items-center justify-center px-2"
    >
      <Icon name="search" class="size-6 text-muted-foreground" />
    </span>
    <div
      class="absolute inset-y-0 end-0 hidden items-center justify-center px-3 md:flex"
    >
      <p class="text-sm text-muted-foreground">
        Press
        <kbd
          class="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"
        >
          <span class="text-xs">⌘</span>K
        </kbd>
      </p>
    </div>
    <CommandDialog :modal="false" v-model:open="open">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="calendar"> Calendar </CommandItem>
          <CommandItem value="search-emoji"> Search Emoji </CommandItem>
          <CommandItem value="calculator"> Calculator </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem value="profile"> Profile </CommandItem>
          <CommandItem value="billing"> Billing </CommandItem>
          <CommandItem value="settings"> Settings </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </button>
</template>
