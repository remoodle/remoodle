<script setup lang="ts">
import { Link } from "@/shared/ui/link";
import { RouteName } from "@/shared/types";
</script>

<template>
  <div class="m-auto flex flex-col items-center justify-center gap-5">
    <div class="flex flex-col items-center">
      <h1 class="text-5xl font-bold">404</h1>
      <h2 class="text-2xl capitalize">Page not found</h2>

      <Link :to="{ name: RouteName.Home }" underline hover class="mt-5">
        Go back home
      </Link>
    </div>
  </div>
</template>
