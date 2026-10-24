<script lang="ts" setup>
import { Checkbox } from "@/components/ui/checkbox";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import AccountMenu from "@/components/AccountMenu.vue";
import ExportSchedule from "@/components/ExportSchedule.vue";
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
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSchedule } from "@/composables/use-schedule";
import { useSessionQuery, useSignOut } from "@/lib/api/session";
import MoodleFilters from "@/components/MoodleFilters.vue";
import ScheduleFilters from "@/components/ScheduleFilters.vue";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

const router = useRouter();

const { filters } = storeToRefs(appStore);

const { events, scheduleEvents, courses, data, moodle, isPending, error, refetch } = useSchedule(
  () => filters.value,
);

const { data: session } = useSessionQuery();

const signOutSession = useSignOut();

async function signOut() {
  await signOutSession();
  await router.replace("/");
}
</script>

<template>
  <SidebarProvider
    :style="{ '--sidebar-width': '18rem' }"
    class="h-svh overflow-hidden bg-background"
  >
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader class="p-3">
        <div class="flex items-center gap-2 px-1">
          <span class="text-sm font-semibold tracking-tight">Calendar</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div class="flex items-center justify-between px-4 pt-3 text-sm font-semibold">
          <span>Schedule</span><Checkbox v-model="filters.classes" aria-label="Show schedule" />
        </div>
        <div v-if="data?.connection" class="px-3 pt-3">
          <ExportSchedule
            :events="scheduleEvents"
            :filters="filters"
            button-class="w-full justify-between"
          />
        </div>
        <template v-if="data?.connection">
          <ScheduleFilters :courses="courses" v-model="filters.courses" />
        </template>

        <div v-else-if="!isPending" class="px-4 py-3 text-xs text-muted-foreground">
          <a
            :href="session?.links.myDu"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-4"
            >Connect My DU</a
          >
          in the bot to add your classes.
        </div>
        <div class="mx-4 my-2 border-t" />
        <SidebarGroup>
          <SidebarGroupLabel class="text-sm font-semibold text-foreground"
            >Moodle</SidebarGroupLabel
          >
          <SidebarGroupContent>
            <MoodleFilters v-if="moodle.data.value?.connected" v-model="filters.moodle" />
            <p v-else-if="!moodle.isPending.value" class="px-2 py-3 text-xs text-muted-foreground">
              <a
                :href="session?.links.moodle"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-4"
                >Connect Moodle</a
              >
              in the bot to add deadlines and events.
            </p>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter class="gap-3 p-3">
        <AccountMenu
          v-if="session?.user"
          :name="session.user.name"
          :username="session.user.username"
          @sign-out="signOut"
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset class="overflow-hidden bg-background">
      <div class="flex min-h-0 flex-1 flex-col overflow-auto">
        <div
          v-if="isPending || moodle.isPending.value"
          class="flex items-center gap-2 p-6 text-sm text-muted-foreground"
          role="status"
        >
          <SidebarTrigger />
          <span>Loading your schedule…</span>
        </div>
        <div
          v-else-if="
            (error || moodle.error.value) && !data?.connection && !moodle.data.value?.connected
          "
          class="space-y-3 p-6"
        >
          <SidebarTrigger />
          <p role="alert">Could not load your schedule.</p>
          <Button
            variant="outline"
            @click="
              refetch();
              moodle.refetch();
            "
            >Try again</Button
          >
        </div>
        <div
          v-else-if="!data?.connection && !moodle.data.value?.connected"
          class="flex h-full flex-col"
        >
          <div class="p-3">
            <SidebarTrigger />
          </div>
          <Empty class="flex-1"
            ><EmptyHeader
              ><EmptyTitle>Your schedule starts here</EmptyTitle
              ><EmptyDescription
                >Connect My DU or Moodle in the ReMoodle bot to build your
                calendar.</EmptyDescription
              ></EmptyHeader
            ><EmptyContent v-if="session" class="flex-row justify-center"
              ><Button as-child
                ><a :href="session.links.myDu" target="_blank" rel="noopener noreferrer"
                  >Connect My DU</a
                ></Button
              ><Button as-child variant="outline"
                ><a :href="session.links.moodle" target="_blank" rel="noopener noreferrer"
                  >Connect Moodle</a
                ></Button
              ></EmptyContent
            ></Empty
          >
        </div>
        <template v-else>
          <p
            v-if="data?.connection && (data.connection.syncError || !data.connection.connected)"
            role="status"
            class="border-b px-4 py-2 text-sm text-muted-foreground"
          >
            {{
              data.connection.syncError ||
              "Updates paused. Reconnect My DU in the bot; showing saved classes."
            }}
          </p>
          <p
            v-if="moodle.error.value"
            role="alert"
            class="border-b px-4 py-2 text-sm text-destructive"
          >
            Could not load Moodle events.
            <Button variant="link" size="sm" @click="moodle.refetch()">Try again</Button>
          </p>
          <p
            v-if="data?.connection && !data.events.length"
            class="px-4 py-3 text-sm text-muted-foreground"
          >
            No classes were found for this period. Check the period with /mydu in the bot.
          </p>
          <Schedule class="min-h-0 w-full flex-1" :events="events" :theme="appStore.theme" />
        </template>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
