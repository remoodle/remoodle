<script setup lang="ts">
import { ChevronsUpDown } from "lucide-vue-next";
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

defineProps<{
  allGroups: string[];
}>();

const group = defineModel<string>({ required: true });

const open = ref(false);
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="min-w-full justify-between sm:min-w-48"
      >
        {{ allGroups.includes(group) ? group : "Select group" }}
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command v-model="group">
        <CommandInput placeholder="Search group..." />
        <CommandEmpty>Group not found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="group in allGroups"
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
