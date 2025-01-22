<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useScheduleStore } from "@/shared/stores/schedule";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
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
          Selected group
          <Badge variant="outline">{{ appStore.group }}</Badge>
        </h1>
      </div>

      <div class="">
        <h1 class="mb-2 font-semibold">Toggle event types</h1>
        <div class="flex flex-wrap gap-2">
          <Badge
            :variant="
              localFilters.eventTypes.lecture ? 'default' : 'destructive'
            "
            class="cursor-pointer"
            @click="
              localFilters.eventTypes.lecture = !localFilters.eventTypes.lecture
            "
          >
            Lecture
          </Badge>
          <Badge
            :variant="
              localFilters.eventTypes.practice ? 'default' : 'destructive'
            "
            class="cursor-pointer"
            @click="
              localFilters.eventTypes.practice =
                !localFilters.eventTypes.practice
            "
          >
            Practice
          </Badge>
          <Badge
            :variant="localFilters.eventTypes.learn ? 'default' : 'destructive'"
            class="cursor-pointer"
            @click="
              localFilters.eventTypes.learn = !localFilters.eventTypes.learn
            "
          >
            Learn
          </Badge>
        </div>
      </div>

      <div class="mt-2">
        <h1 class="mb-2 font-semibold">Toggle event formats</h1>
        <div class="flex flex-wrap gap-2">
          <Badge
            :variant="
              localFilters.eventFormats.online ? 'default' : 'destructive'
            "
            class="cursor-pointer"
            @click="
              localFilters.eventFormats.online =
                !localFilters.eventFormats.online
            "
          >
            Online
          </Badge>
          <Badge
            :variant="
              localFilters.eventFormats.offline ? 'default' : 'destructive'
            "
            class="cursor-pointer"
            @click="
              localFilters.eventFormats.offline =
                !localFilters.eventFormats.offline
            "
          >
            Offline
          </Badge>
        </div>
      </div>

      <div class="mt-2">
        <h1 class="mb-2 font-semibold">Toggle courses</h1>
        <div class="flex flex-wrap gap-2">
          <Badge
            v-for="course in props.courses"
            :key="course"
            :variant="
              !localFilters.excludedCourses.includes(course)
                ? 'default'
                : 'destructive'
            "
            class="cursor-pointer"
            @click="
              localFilters.excludedCourses.includes(course)
                ? (localFilters.excludedCourses =
                    localFilters.excludedCourses.filter((c) => c !== course))
                : localFilters.excludedCourses.push(course)
            "
          >
            {{ course }}
          </Badge>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleReset"> Reset </Button>
        <Button type="submit" @click="handleSave"> Save changes </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
