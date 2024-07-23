<script setup lang="ts">
import { useUserStore } from "@/shared/stores/user";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";

const userStore = useUserStore();
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Notification</h3>
    <p class="text-sm text-muted-foreground">
      Configure how you receive notifications
    </p>
  </div>
  <Separator />
  <div></div>
  Coming soon
</template>
