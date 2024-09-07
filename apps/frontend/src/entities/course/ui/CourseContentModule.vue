<script setup lang="ts">
import { prepareFileURL } from "@/shared/lib/helpers";
import type { CourseModule } from "@remoodle/types";
import { RouteName } from "@/shared/lib/routes";
import { Link } from "@/shared/ui/link";
import { Text } from "@/shared/ui/text";
import { filesize } from "@/shared/lib/helpers";

defineProps<{
  courseId: number;
  module: CourseModule;
  token: string;
}>();
</script>

<template>
  <!-- {{ module.modname }} -->
  <div class="space-y-1">
    <div
      class="flex items-center gap-2"
      :class="[
        {
          'opacity-50': module.modname === 'assign' && !module.uservisible,
        },
      ]"
    >
      <!-- {{ module.uservisible }}
      {{ module.visibleoncoursepage }} -->
      <img :src="module.modicon" class="h-auto w-6 flex-none" />
      <span>
        <template v-if="module.url">
          <component
            :is="
              module.modname === 'assign' && module.uservisible ? Link : 'span'
            "
            :to="
              module.contents?.length === 1
                ? prepareFileURL(module.contents[0].fileurl, token)
                : {
                    name: RouteName.Assignment,
                    params: {
                      courseId: courseId,
                      assignmentId: module.instance,
                    },
                  }
            "
            hover
          >
            {{ module.name }}
          </component>
        </template>
        <template v-else>
          <Text :msg="module.name" />
        </template>
      </span>
    </div>
    <template v-if="module.availabilityinfo">
      <Text :msg="module.availabilityinfo" class="text-sm" />
    </template>
    <Text
      v-if="module.description?.length"
      :msg="module.description"
      class="prose prose-sm my-0.5 border-l-4 pl-2 text-foreground"
    />
    <template v-if="module.contents && module.contents.length">
      <ul class="flex flex-col gap-2">
        <template v-for="item in module.contents" :key="item.timecreated">
          <span class="break-all text-sm text-muted-foreground">
            <template v-if="item.type === 'url'">
              {{ item.fileurl }}
            </template>
            <template v-else-if="item.type === 'file'">
              <Link :to="prepareFileURL(item.fileurl, token)" hover underline>
                {{ item.filename }},
                {{ filesize(item.filesize) }}
              </Link>
            </template>
          </span>
        </template>
      </ul>
    </template>
  </div>
</template>
