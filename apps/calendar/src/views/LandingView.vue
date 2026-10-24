<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthDialog from "@/components/AuthDialog.vue";
import LandingCalendar from "@/components/LandingCalendar.vue";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import { useSessionQuery } from "@/lib/api/session";

const route = useRoute();

const router = useRouter();

const { data: session, isLoading } = useSessionQuery();

const next = Array.isArray(route.query.next) ? route.query.next[0] : route.query.next;

const callbackURL = next?.startsWith("/") ? next : "/schedule";

watch(session, (currentSession) => {
  if (currentSession?.user) {
    router.replace(callbackURL);
  }
});
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background text-foreground">
    <header class="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
      <a href="/" class="text-sm font-semibold tracking-tight">ReMoodle Calendar</a>
      <ThemeSwitcher />
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-6">
      <section
        class="grid items-center gap-10 py-12 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16"
        aria-labelledby="landing-title"
      >
        <div class="space-y-6">
          <div class="space-y-3">
            <h1
              id="landing-title"
              class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
            >
              Your AITU week in one place
            </h1>
            <p class="max-w-md text-base text-pretty text-muted-foreground">
              Classes from My DU and deadlines from Moodle, together in one calendar, with reminders
              in Telegram.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <AuthDialog v-if="!isLoading">
              <Button size="lg">
                <Icon icon="mdi:telegram" class="size-5" aria-hidden="true" />
                Sign in with Telegram
              </Button>
            </AuthDialog>
            <Button v-else size="lg" disabled aria-live="polite">Checking your session…</Button>
          </div>
        </div>
        <LandingCalendar />
      </section>
    </main>

    <footer class="border-t">
      <div
        class="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6 text-sm text-muted-foreground"
      >
        <span>Made for AITU students</span>
        <a
          href="https://github.com/remoodle/heresy"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          GitHub <Icon icon="lucide:arrow-up-right" class="size-3.5" aria-hidden="true" />
        </a>
      </div>
    </footer>
  </div>
</template>
