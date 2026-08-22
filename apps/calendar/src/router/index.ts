import { createRouter, createWebHistory } from "vue-router";
import { authClient } from "@/lib/auth-client";
import AccountView from "../views/AccountView.vue";
import AuthCallbackView from "../views/AuthCallbackView.vue";
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
      path: "/api/auth/callback/:provider",
      component: AuthCallbackView,
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach(async (to) => {
  const session = await authClient.getSession();
  const next =
    typeof to.query.next === "string" && to.query.next.startsWith("/") ? to.query.next : null;

  if (to.meta.requiresAuth) {
    if (!session.data) return { path: "/login", query: { next: to.fullPath } };
    return true;
  }

  if ((to.name === "landing" || to.name === "login") && session.data) {
    return { path: next ?? "/schedule" };
  }

  return true;
});

export default router;
