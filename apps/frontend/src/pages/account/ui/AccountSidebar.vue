<script setup lang="ts">
import { useRoute } from "vue-router";
import { cn } from "@/shared/lib/helpers";
import { Button } from "@/shared/ui/button";
import { Link } from "@/shared/ui/link";
import { RouteName } from "@/shared/types";

interface Item {
  title: string;
  route: string;
}

const route = useRoute();

const sidebarNavItems: Item[] = [
  {
    title: "Profile",
    route: RouteName.AccountProfile,
  },
  {
    title: "Notifications",
    route: RouteName.AccountNotifications,
  },
];
</script>

<template>
  <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
    <Link
      v-for="item in sidebarNavItems"
      :key="item.title"
      :to="{ name: item.route }"
    >
      <Button
        variant="ghost"
        :class="
          cn(
            'w-full justify-start text-left',
            route.name === item.route && 'bg-muted hover:bg-muted',
          )
        "
      >
        {{ item.title }}
      </Button>
    </Link>
  </nav>
</template>
