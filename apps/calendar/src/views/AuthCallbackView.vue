<script setup lang="ts">
import { onMounted } from "vue";

onMounted(async () => {
  const { pathname, search } = window.location;
  const params = new URLSearchParams(search);
  const next =
    params.get("callbackURL") ?? params.get("callbackUrl") ?? params.get("next") ?? "/schedule";
  try {
    // Fetch the callback URL so the worker processes it (sets session cookie)
    await fetch(pathname + search, { credentials: "include" });
  } catch {
    // ignore — session may still be set
  }
  window.location.replace(next.startsWith("/") ? next : "/schedule");
});
</script>

<template>
  <div />
</template>
