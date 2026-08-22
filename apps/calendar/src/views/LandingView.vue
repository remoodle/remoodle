<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AuthDialog from "@/components/AuthDialog.vue";
import LandingCalendar from "@/components/LandingCalendar.vue";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useSessionQuery } from "@/lib/api/session";

const route = useRoute();
const router = useRouter();
const { data: session, isLoading } = useSessionQuery();

const next = Array.isArray(route.query.next) ? route.query.next[0] : route.query.next;
const callbackURL = next || "/schedule";

watch(session, (currentSession) => {
  if (currentSession?.data) router.replace(callbackURL);
});
</script>

<template>
  <div class="landing-page">
    <header class="landing-header landing-rule">
      <a href="/" class="landing-brand">ReMoodle Calendar</a>
      <ThemeSwitcher />
    </header>
    <main>
      <LandingCalendar />
      <section class="landing-action landing-rule" aria-label="Get started">
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
      <section class="landing-copy landing-rule" aria-labelledby="landing-title">
        <h1 id="landing-title">Know what's next.</h1>
        <p class="landing-description">
          Your AITU classes and Moodle deadlines, together in one calendar.
        </p>
        <ul class="landing-features">
          <li>
            <Icon icon="lucide:calendar-days" aria-hidden="true" /><span
              >Plan your week around your classes</span
            >
          </li>
          <li>
            <Icon icon="lucide:circle-check" aria-hidden="true" /><span
              >See which assignments are due next</span
            >
          </li>
          <li>
            <Icon icon="lucide:calendar-arrow-down" aria-hidden="true" /><span
              >Add your schedule to your calendar app</span
            >
          </li>
        </ul>
      </section>
    </main>
    <footer class="landing-footer landing-rule">
      <span>Made for AITU students</span>
      <a href="https://github.com/remoodle/heresy" target="_blank" rel="noopener noreferrer">
        GitHub <Icon icon="lucide:arrow-up-right" aria-hidden="true" />
      </a>
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  width: min(100% - 40px, 672px);
  min-height: 100svh;
  margin-inline: auto;
  border-inline: 1px solid var(--border);
  color: var(--foreground);
}
/* Extend the section rules beyond the column without creating horizontal overflow. */
.landing-rule {
  position: relative;
}
.landing-rule::before {
  position: absolute;
  inset: 0 calc((100% - 100vw) / 2) auto;
  height: 1px;
  background: var(--border);
  content: "";
  pointer-events: none;
}
.landing-header {
  display: flex;
  min-height: 56px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 24px;
}
.landing-header::before {
  top: auto;
  bottom: 0;
}
.landing-brand {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.025em;
  text-decoration: none;
}
.landing-action {
  padding: 10px 24px;
}
.landing-sign-in {
  width: 100%;
  height: 42px;
  justify-content: space-between;
  padding-inline: 16px;
  font-size: 14px;
  box-shadow: none;
}
.landing-sign-in:focus-visible {
  outline: 2px solid var(--foreground);
  outline-offset: 4px;
}
.landing-copy {
  padding: 22px 32px 24px;
}
h1 {
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2rem);
  line-height: 1.12;
  font-weight: 550;
  letter-spacing: -0.045em;
}
.landing-description {
  max-width: 510px;
  margin: 12px 0 0;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 1.6;
}
.landing-features {
  display: grid;
  gap: 10px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}
.landing-features li {
  display: flex;
  align-items: center;
  gap: 13px;
  font-size: 14px;
}
.landing-features svg {
  flex-shrink: 0;
  width: 17px;
  height: 17px;
  color: var(--primary);
}
.landing-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  color: var(--muted-foreground);
  font-size: 12px;
}
.landing-footer a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
    width: calc(100% - 24px);
  }
  .landing-header,
  .landing-action,
  .landing-footer {
    padding-inline: 16px;
  }
  .landing-copy {
    padding: 20px;
  }
  .landing-brand {
    font-size: 12px;
  }
  .landing-features li {
    font-size: 13px;
  }
}
</style>
