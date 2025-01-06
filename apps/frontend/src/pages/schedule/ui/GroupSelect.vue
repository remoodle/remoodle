<script setup lang="ts">
import { ref } from "vue";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useAppStore } from "@/shared/stores/app";

const appStore = useAppStore();
const selectedGroup = ref<string>(appStore.group || "SE-2203");

const onChangeGroup = (newGroup: string) => {
  selectedGroup.value = newGroup;
  appStore.setGroup(newGroup);
};

const groups = {
  "Software Engineering": ["SE-2203", "SE-2204"],
  "Computer Science": ["IT-2203", "IT-2204"],
  "Cyber Security": ["CS-2203", "CS-2204"],
  "Media Technologies": ["MT-2203", "MT-2204"],
  "Big Data Analytics": ["BDA-2203", "BDA-2204"],
  "IT Management": ["ITM-2203", "ITM-2204"],
  "IT Entrepreneurship": ["ITE-2203", "ITE-2204"],
};
</script>

<template>
  <Select v-model="selectedGroup" @update:model-value="onChangeGroup">
    <SelectTrigger>
      <SelectValue :placeholder="selectedGroup || 'Select group'" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup v-for="(items, label) in groups" :key="label">
        <SelectLabel>{{ label }}</SelectLabel>
        <div v-for="item in items" :key="item">
          <SelectItem :value="item">{{ item }}</SelectItem>
        </div>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
