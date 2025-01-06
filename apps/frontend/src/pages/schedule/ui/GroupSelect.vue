<script setup lang="ts">
import { Button } from "@/shared/ui/button";
import { useAppStore } from "@/shared/stores/app";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { ChevronsUpDown } from "lucide-vue-next";
import { ref } from "vue";
import type { AcceptableValue } from "node_modules/radix-vue/dist/shared/types";

const appStore = useAppStore();

const selectedGroup = ref<string>(appStore.group || "SE-2203");

const onChangeGroup = (newGroup: AcceptableValue): void => {
  selectedGroup.value = newGroup as string;
  appStore.setGroup(newGroup as string);
};

const props = defineProps<{
  groups: Record<string, string[]>;
}>();

const open = ref(false);
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-[200px] justify-between"
      >
        {{ selectedGroup || "Select group" }}

        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command v-model="selectedGroup" @update:model-value="onChangeGroup">
        <CommandInput placeholder="Search framework..." />
        <CommandEmpty>No framework found.</CommandEmpty>
        <CommandList>
          <CommandGroup
            v-for="(groupType, label) in props.groups"
            :key="label"
            :title="label"
          >
            <CommandItem
              v-for="group in groupType"
              :key="group"
              :value="group"
              @select="open = false"
            >
              {{ group }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
