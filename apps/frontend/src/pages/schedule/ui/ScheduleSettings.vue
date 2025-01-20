<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useScheduleStore } from "@/shared/stores/schedule";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { defineProps } from "vue";
import { useAppStore } from "@/shared/stores/app";

const props = defineProps<{
  courses: string[];
}>();

const appStore = useAppStore();

const scheduleStore = useScheduleStore();

const localFilters = ref({
  eventTypes: {
    lecture: true,
    practice: true,
    learn: true,
  },
  eventFormats: {
    online: true,
    offline: true,
  },
  excludedCourses: [] as string[],
});

let open = ref<boolean>(false);

onMounted(() => {
  const currentFilters = scheduleStore.getFilters(appStore.group);
  localFilters.value = {
    eventTypes: { ...currentFilters.eventTypes },
    eventFormats: { ...currentFilters.eventFormats },
    excludedCourses: [...currentFilters.excludedCourses],
  };
});

watch(
  () => appStore.group,
  () => {
    const newFilters = scheduleStore.getFilters(appStore.group);
    localFilters.value = {
      eventTypes: { ...newFilters.eventTypes },
      eventFormats: { ...newFilters.eventFormats },
      excludedCourses: [...newFilters.excludedCourses],
    };
  },
);

const isChecked = (course: string): boolean => {
  return !localFilters.value.excludedCourses.includes(course);
};

const handleCourseToggle = (course: string, checked: boolean) => {
  if (checked) {
    localFilters.value.excludedCourses =
      localFilters.value.excludedCourses.filter((c) => c !== course);
  } else {
    localFilters.value.excludedCourses.push(course);
  }
};

const handleSave = () => {
  scheduleStore.saveFilters(appStore.group, {
    selectedGroup: appStore.group,
    eventTypes: { ...localFilters.value.eventTypes },
    eventFormats: { ...localFilters.value.eventFormats },
    excludedCourses: [...localFilters.value.excludedCourses],
  });
  open.value = false;

  const currentFilters = scheduleStore.getFilters(appStore.group);
  localFilters.value = {
    eventTypes: { ...currentFilters.eventTypes },
    eventFormats: { ...currentFilters.eventFormats },
    excludedCourses: [...currentFilters.excludedCourses],
  };
};

const handleReset = () => {
  scheduleStore.resetFilters(appStore.group);
  open.value = false;

  const currentFilters = scheduleStore.getFilters(appStore.group);
  localFilters.value = {
    eventTypes: { ...currentFilters.eventTypes },
    eventFormats: { ...currentFilters.eventFormats },
    excludedCourses: [...currentFilters.excludedCourses],
  };
};
</script>

<template>
  <Dialog v-model:open="open" @update:open="open = $event">
    <DialogTrigger as-child>
      <Button variant="outline"> Filter </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Filter for events</DialogTitle>
        <DialogDescription>
          Make changes to your schedule and click save when you're done.
        </DialogDescription>
      </DialogHeader>

      <div class="mt-2">
        <h1 class="">
          Selected group →
          <span class="font-semibold">{{ appStore.group }}</span>
        </h1>
      </div>

      <div class="">
        <h1 class="mb-2 font-semibold">Toggle event types</h1>
        <div class="flex gap-8">
          <div class="flex items-center gap-2 text-center">
            <Checkbox
              v-model:checked="localFilters.eventTypes.lecture"
              name="toggle-lecture"
              id="toggle-lecture"
            />
            <Label for="toggle-lecture"> Lecture </Label>
          </div>
          <div class="flex items-center gap-2 text-center">
            <Checkbox
              v-model:checked="localFilters.eventTypes.practice"
              name="toggle-practice"
              id="toggle-practice"
            />
            <Label for="toggle-practice"> Practice </Label>
          </div>
          <div class="flex items-center gap-2 text-center">
            <Checkbox
              v-model:checked="localFilters.eventTypes.learn"
              name="toggle-learn"
              id="toggle-learn"
            />
            <Label for="toggle-learn"> Learn </Label>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <h1 class="mb-2 font-semibold">Toggle event formats</h1>
        <div class="flex gap-8">
          <div class="flex items-center gap-2 text-center">
            <Checkbox
              v-model:checked="localFilters.eventFormats.online"
              name="toggle-online"
              id="toggle-online"
            />
            <Label for="toggle-online"> Online </Label>
          </div>
          <div class="flex items-center gap-2 text-center">
            <Checkbox
              v-model:checked="localFilters.eventFormats.offline"
              name="toggle-offline"
              id="toggle-offline"
            />
            <Label for="toggle-offline"> Offline </Label>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <h1 class="mb-2 font-semibold">Toggle courses</h1>
        <div class="flex flex-col gap-2">
          <div
            v-for="course in props.courses"
            :key="course"
            class="flex items-center gap-2 text-center"
          >
            <Checkbox
              :checked="isChecked(course)"
              @update:checked="(checked) => handleCourseToggle(course, checked)"
              :name="'toggle-' + course"
              :id="'toggle-' + course"
            />
            <Label :for="'toggle-' + course"> {{ course }} </Label>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleReset"> Reset </Button>
        <Button type="submit" @click="handleSave"> Save changes </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
