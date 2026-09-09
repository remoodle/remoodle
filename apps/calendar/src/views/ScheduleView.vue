<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { storeToRefs } from "pinia";
import { watch } from "vue";
import { RouterLink, useRouter } from "vue-router";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSchedule } from "@/composables/use-schedule";
import { useSessionQuery, useClearSession } from "@/lib/api/session";
import { defaultFilters } from "../../shared/schedule";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const router = useRouter();
const { filters } = storeToRefs(appStore);

const { events, courses, data, isPending, error, refetch } = useSchedule(() => filters.value);
const { data: session } = useSessionQuery();
const clearSession = useClearSession();
watch(
  () => session.value?.data?.user.id,
  () => {
    filters.value = defaultFilters();
  },
);

function toggleCourse(course: string) {
  const f = filters.value;
  if (f.excludedCourses.includes(course)) {
    f.excludedCourses = f.excludedCourses.filter((c) => c !== course);
  } else {
    f.excludedCourses = [...f.excludedCourses, course];
  }
}

function isCourseIncluded(course: string): boolean {
  return !filters.value.excludedCourses.includes(course);
}

async function signOut() {
  await authClient.signOut();
  clearSession();
  await router.replace("/");
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

        <template v-if="data?.connection">
          <div class="px-1">
            <ExportToIcal
              :events="events"
              :filters="filters"
              button-class="w-full justify-between"
            />
          </div>
        </template>
      </SidebarHeader>

      <SidebarContent>
        <template v-if="data?.connection">
          <SidebarGroup>
            <SidebarGroupLabel>Event types</SidebarGroupLabel>
            <SidebarGroupContent>
              <div class="flex flex-col px-1">
                <label
                  v-for="key in ['lecture', 'practice'] as const"
                  :key="key"
                  class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                >
                  <Checkbox v-model="filters.eventTypes[key]" />
                  <span class="leading-tight capitalize">{{ key }}</span>
                </label>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Event formats</SidebarGroupLabel>
            <SidebarGroupContent>
              <div class="flex flex-col px-1">
                <label
                  v-for="key in ['online', 'offline'] as const"
                  :key="key"
                  class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                >
                  <Checkbox v-model="filters.eventFormats[key]" />
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
                  v-for="course in courses"
                  :key="course"
                  class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                >
                  <Checkbox
                    :model-value="isCourseIncluded(course)"
                    @update:model-value="toggleCourse(course)"
                  />
                  <span class="leading-tight">{{ course }}</span>
                </label>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </template>

        <div v-else class="px-2 py-6 text-center text-xs text-muted-foreground">
          Connect My DU to load your personal schedule
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
          <Button as-child variant="ghost" size="sm"
            ><RouterLink to="/account"
              ><Icon icon="lucide:settings-2" class="size-4" />Settings</RouterLink
            ></Button
          >
        </div>
      </header>

      <div class="flex min-h-0 flex-1 flex-col overflow-auto">
        <p v-if="isPending" class="p-6 text-sm text-muted-foreground" role="status">
          Loading your schedule…
        </p>
        <div v-else-if="error" class="space-y-3 p-6">
          <p role="alert">Could not load your schedule.</p>
          <Button variant="outline" @click="refetch()">Try again</Button>
        </div>
        <Empty v-else-if="!data?.connection" class="h-full"
          ><EmptyHeader
            ><EmptyTitle>Your schedule starts here</EmptyTitle
            ><EmptyDescription
              >Connect My DU in Settings to import your university classes.</EmptyDescription
            ></EmptyHeader
          ><EmptyContent
            ><Button as-child
              ><RouterLink to="/account">Connect My DU</RouterLink></Button
            ></EmptyContent
          ></Empty
        >
        <template v-else>
          <p
            v-if="data.connection.syncError || !data.connection.connected"
            role="status"
            class="border-b px-4 py-2 text-sm text-muted-foreground"
          >
            {{ data.connection.syncError || "Disconnected. Showing saved classes." }}
          </p>
          <p v-if="!data.events.length" class="px-4 py-3 text-sm text-muted-foreground">
            No classes were found for this term. Check your My DU connection settings.
          </p>
          <Schedule class="min-h-0 w-full flex-1" :events="events" :theme="appStore.theme" />
        </template>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
