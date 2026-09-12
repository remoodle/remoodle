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

const callbackURL = next || "/schedule";

watch(session, (currentSession) => {
  if (currentSession?.data) {
    router.replace(callbackURL);
  }
});
</script>

<template>
  <div class="landing-page">
    <header class="landing-header">
      <a href="/" class="landing-brand">ReMoodle Calendar</a>
      <ThemeSwitcher />
    </header>
    <main>
      <section class="landing-copy" aria-labelledby="landing-title">
        <h1 id="landing-title" class="landing-title">Know what's next<span>.</span></h1>
        <p class="landing-description">
          Your AITU classes and Moodle deadlines, together in one calendar.
        </p>
      </section>
      <section class="landing-action" aria-label="Get started">
        <AuthDialog v-if="!isLoading" :callback-u-r-l="callbackURL">
          <Button class="landing-sign-in">
            Access your schedule
            <Icon icon="lucide:arrow-right" aria-hidden="true" />
          </Button>
        </AuthDialog>
        <Button v-else disabled class="landing-sign-in" aria-live="polite"
          >Checking your session…</Button
        >
      </section>
      <LandingCalendar />
    </main>
    <footer class="landing-footer">
      <span>Made for AITU students</span>
      <a href="https://github.com/remoodle/heresy" target="_blank" rel="noopener noreferrer">
        GitHub <Icon icon="lucide:arrow-up-right" aria-hidden="true" />
      </a>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  width: min(100% - 48px, 960px);
  min-height: 100svh;
  margin-inline: auto;
  color: var(--foreground);
}
.landing-header {
  display: flex;
  max-width: 680px;
  margin-inline: auto;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
}
.landing-brand {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.035em;
  text-decoration: none;
}
.landing-action {
  max-width: 260px;
  margin: 0 auto 32px;
}
.landing-sign-in {
  position: relative;
  width: 100%;
  height: 36px;
  justify-content: center;
  padding-inline: 48px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.025em;
  box-shadow: none;
}
.landing-sign-in :deep(svg) {
  position: absolute;
  right: 14px;
  width: 16px;
  height: 16px;
}
.landing-sign-in:focus-visible {
  outline: 2px solid var(--foreground);
  outline-offset: 4px;
}
.landing-copy {
  padding: 36px 0 28px;
  text-align: center;
}
.landing-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.12;
  font-weight: 600;
  letter-spacing: -0.05em;
}
.landing-title span {
  color: #9b87f5;
}
.landing-description {
  margin: 10px auto 0;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 1.6;
}
.landing-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 26px 0;
  margin-top: 32px;
  color: var(--muted-foreground);
  font-size: 13px;
}
.landing-footer a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-left: 20px;
  border-left: 1px solid var(--border);
  text-underline-offset: 4px;
}
.landing-footer a:hover {
  color: var(--foreground);
  text-decoration: underline;
}
.landing-footer svg {
  width: 14px;
  height: 14px;
}
@media (max-width: 480px) {
  .landing-page {
    width: calc(100% - 32px);
  }
  .landing-header {
    min-height: 64px;
  }
  .landing-brand {
    font-size: 14px;
  }
  .landing-action {
    margin-bottom: 24px;
  }
  .landing-sign-in {
    font-size: 14px;
  }
  .landing-copy {
    padding: 24px 0;
  }
  .landing-description {
    font-size: 14px;
  }
  .landing-footer {
    gap: 14px;
    font-size: 12px;
  }
  .landing-footer a {
    padding-left: 14px;
  }
}
</style>
