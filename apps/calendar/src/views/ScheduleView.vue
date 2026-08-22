<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { CalendarDays } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { ref, watchEffect } from "vue";
import { useRouter } from "vue-router";
import AccountMenu from "@/components/AccountMenu.vue";
import AuthDialog from "@/components/AuthDialog.vue";
import ExportToIcal from "@/components/ExportToIcal.vue";
import Schedule from "@/components/Schedule.vue";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSchedule } from "@/composables/use-schedule";
import { useSessionQuery, useClearSession } from "@/lib/api/session";
import { useSetPrimaryGroup, useUserProfileQuery } from "@/lib/api/user";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const router = useRouter();
const { group, filters } = storeToRefs(appStore);

const { groupSchedule, allGroups, groupCourses } = useSchedule(
  () => group.value,
  () => filters.value,
);

const { data: session } = useSessionQuery();
const { data: profile, isPending: profilePending } = useUserProfileQuery();
const setPrimaryGroup = useSetPrimaryGroup();
const clearSession = useClearSession();
const hasTriedPrimaryGroupMigration = ref(false);
const pendingPrimaryGroup = ref("");

async function migratePrimaryGroup(primaryGroup: string) {
  try {
    pendingPrimaryGroup.value = primaryGroup;
    await setPrimaryGroup.mutateAsync(primaryGroup);
  } catch {
    hasTriedPrimaryGroupMigration.value = false;
  } finally {
    if (pendingPrimaryGroup.value === primaryGroup) {
      pendingPrimaryGroup.value = "";
    }
  }
}

watchEffect(() => {
  const primaryGroup = pendingPrimaryGroup.value || profile.value?.primaryGroup || "";
  const storedGroup = group.value;

  if (primaryGroup && group.value !== primaryGroup) {
    group.value = primaryGroup;
    return;
  }

  if (
    session.value?.data &&
    !profilePending.value &&
    !primaryGroup &&
    storedGroup &&
    allGroups.value?.includes(storedGroup) &&
    !setPrimaryGroup.isPending.value &&
    !hasTriedPrimaryGroupMigration.value
  ) {
    hasTriedPrimaryGroupMigration.value = true;
    void migratePrimaryGroup(storedGroup);
    return;
  }

  if (group.value && allGroups.value && !allGroups.value.includes(group.value)) {
    group.value = "";
  }
});

function toggleCourse(course: string) {
  if (!group.value || !filters.value[group.value]) return;
  const f = filters.value[group.value]!;
  if (f.excludedCourses.includes(course)) {
    f.excludedCourses = f.excludedCourses.filter((c) => c !== course);
  } else {
    f.excludedCourses = [...f.excludedCourses, course];
  }
}

function isCourseIncluded(course: string): boolean {
  return (
    !!group.value &&
    !!filters.value[group.value] &&
    !filters.value[group.value]!.excludedCourses.includes(course)
  );
}

async function signOut() {
  await authClient.signOut();
  clearSession();
  await router.replace("/");
}

function openAccountSettings() {
  router.push("/account");
}
</script>

<template>
  <SidebarProvider
    :style="{ '--sidebar-width': '18rem' }"
    class="h-svh overflow-hidden bg-background"
  >
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader class="gap-4 p-3">
        <div class="flex items-center gap-2 px-1">
          <span class="text-sm font-semibold tracking-tight">ReMoodle Calendar</span>
        </div>

        <template v-if="group && filters[group]">
          <div class="px-1">
            <ExportToIcal
              :events="groupSchedule"
              :group="group"
              :filters="filters[group]"
              button-class="w-full justify-between"
            />
          </div>
        </template>
      </SidebarHeader>

      <SidebarContent>
        <template v-if="group && filters[group]">
          <SidebarGroup>
            <SidebarGroupLabel>Event Types</SidebarGroupLabel>
            <SidebarGroupContent>
              <div class="flex flex-col px-1">
                <label
                  v-for="key in ['lecture', 'practice', 'learn'] as const"
                  :key="key"
                  class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                  @click.prevent="
                    filters[group]!.eventTypes[key] = !filters[group]!.eventTypes[key]
                  "
                >
                  <div
                    class="flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors"
                    :class="
                      filters[group]!.eventTypes[key] ? 'border-primary bg-primary' : 'border-input'
                    "
                  >
                    <Icon
                      v-if="filters[group]!.eventTypes[key]"
                      icon="lucide:check"
                      class="size-3 text-primary-foreground"
                    />
                  </div>
                  <span class="leading-tight capitalize">{{ key }}</span>
                </label>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Event Formats</SidebarGroupLabel>
            <SidebarGroupContent>
              <div class="flex flex-col px-1">
                <label
                  v-for="key in ['online', 'offline'] as const"
                  :key="key"
                  class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                  @click.prevent="
                    filters[group]!.eventFormats[key] = !filters[group]!.eventFormats[key]
                  "
                >
                  <div
                    class="flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors"
                    :class="
                      filters[group]!.eventFormats[key]
                        ? 'border-primary bg-primary'
                        : 'border-input'
                    "
                  >
                    <Icon
                      v-if="filters[group]!.eventFormats[key]"
                      icon="lucide:check"
                      class="size-3 text-primary-foreground"
                    />
                  </div>
                  <span class="leading-tight capitalize">{{ key }}</span>
                </label>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Courses</SidebarGroupLabel>
            <SidebarGroupContent>
              <div class="flex flex-col px-1">
                <label
                  v-for="course in groupCourses"
                  :key="course"
                  class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                  @click.prevent="toggleCourse(course)"
                >
                  <div
                    class="flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors"
                    :class="isCourseIncluded(course) ? 'border-primary bg-primary' : 'border-input'"
                  >
                    <Icon
                      v-if="isCourseIncluded(course)"
                      icon="lucide:check"
                      class="size-3 text-primary-foreground"
                    />
                  </div>
                  <span class="leading-tight">{{ course }}</span>
                </label>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </template>

        <div v-else class="px-2 py-6 text-center text-xs text-muted-foreground">
          Choose your primary group to load your schedule
        </div>
      </SidebarContent>

      <SidebarFooter class="gap-3 p-3">
        <template v-if="session?.data">
          <AccountMenu
            :name="session.data.user.name"
            :email="session.data.user.email"
            @sign-out="signOut"
          />
        </template>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset class="overflow-hidden bg-background">
      <header class="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <div class="mx-2 h-4 w-px bg-border" />
        <span class="text-sm font-medium">Schedule</span>
        <div class="ml-auto flex items-center gap-2">
          <template v-if="!session?.data">
            <AuthDialog>
              <Button variant="ghost" size="sm" class="text-muted-foreground">Sign in</Button>
            </AuthDialog>
          </template>
          <Button v-if="group" variant="ghost" size="sm" @click="openAccountSettings">
            {{ group }}
          </Button>
        </div>
      </header>

      <div class="min-h-0 flex-1 overflow-hidden">
        <Schedule class="h-full w-full" :events="groupSchedule" :theme="appStore.theme" />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
