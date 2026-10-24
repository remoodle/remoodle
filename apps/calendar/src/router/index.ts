import { createRouter, createWebHistory } from "vue-router";
import { sessionQuery } from "@/lib/api/session";
import { queryClient } from "@/lib/query-client";
import AccountView from "../views/AccountView.vue";
import LandingView from "../views/LandingView.vue";
import ScheduleView from "../views/ScheduleView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "landing",
      component: LandingView,
    },
    {
      path: "/login",
      name: "login",
      component: LandingView,
    },
    {
      path: "/schedule",
      name: "schedule",
      component: ScheduleView,
      meta: { requiresAuth: true },
    },
    {
      path: "/account",
      name: "account",
      component: AccountView,
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach(async (to) => {
  // An unreachable API reads as signed out, so public pages still render.
  const session = await queryClient.ensureQueryData(sessionQuery).catch(() => ({ user: null }));

  const nextValue = Array.isArray(to.query.next) ? to.query.next[0] : to.query.next;
  const next = nextValue?.startsWith("/") ? nextValue : null;

  if (to.meta.requiresAuth) {
    if (!session.user) {
      return { path: "/login", query: { next: to.fullPath } };
    }

    return true;
  }

  if ((to.name === "landing" || to.name === "login") && session.user) {
    return { path: next ?? "/schedule" };
  }

  return true;
});

export default router;
