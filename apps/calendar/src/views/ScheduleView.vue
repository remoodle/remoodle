<script lang="ts" setup>
import { Icon } from "@iconify/vue";
import MyDuConnection from "@/components/MyDuConnection.vue";
import { storeToRefs } from "pinia";
import { watch } from "vue";
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
                  v-for="key in ['lecture', 'practice', 'learn'] as const"
                  :key="key"
                  class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                  @click.prevent="filters.eventTypes[key] = !filters.eventTypes[key]"
                >
                  <div
                    class="flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors"
                    :class="filters.eventTypes[key] ? 'border-primary bg-primary' : 'border-input'"
                  >
                    <Icon
                      v-if="filters.eventTypes[key]"
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
            <SidebarGroupLabel>Event formats</SidebarGroupLabel>
            <SidebarGroupContent>
              <div class="flex flex-col px-1">
                <label
                  v-for="key in ['online', 'offline'] as const"
                  :key="key"
                  class="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-sidebar-accent"
                  @click.prevent="filters.eventFormats[key] = !filters.eventFormats[key]"
                >
                  <div
                    class="flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors"
                    :class="
                      filters.eventFormats[key] ? 'border-primary bg-primary' : 'border-input'
                    "
                  >
                    <Icon
                      v-if="filters.eventFormats[key]"
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
                  v-for="course in courses"
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
          <Button variant="ghost" size="sm" @click="openAccountSettings"> My DU connection </Button>
        </div>
      </header>

      <div class="min-h-0 flex-1 overflow-auto">
        <p v-if="isPending" class="p-6 text-sm text-muted-foreground" role="status">
          Loading your schedule…
        </p>
        <div v-else-if="error" class="space-y-3 p-6">
          <p role="alert">Could not load your schedule.</p>
          <Button variant="outline" @click="refetch()">Try again</Button>
        </div>
        <MyDuConnection v-else-if="!data?.connection" />
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
          <Schedule class="h-full w-full" :events="events" :theme="appStore.theme" />
        </template>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
