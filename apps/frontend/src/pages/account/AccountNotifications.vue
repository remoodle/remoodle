<script setup lang="ts">
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { useToast } from "@/shared/ui/toast";
import { api } from "@/shared/api";
import { createAsyncProcess } from "@/shared/utils";

const props = defineProps<{
  settings: {
    telegramId?: number | undefined;
  };
}>();

const { toast } = useToast();

const TELEGRAM_BOT_URL = "https://t.me/remoodlebot";

const { run: generate, loading } = createAsyncProcess(async () => {
  const [data, error] = await api.generateOTP();

  if (error) {
    toast({
      title: error.message,
    });
    throw error;
  }

  window.open(`${TELEGRAM_BOT_URL}?start=${data.otp}`, "_blank");
});
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Notification</h3>
    <p class="text-sm text-muted-foreground">
      Configure how you receive notifications
    </p>
  </div>
  <Separator />
  <template v-if="settings.telegramId">
    <p class="text-sm text-muted-foreground">
      Telegram ID: <strong>{{ settings.telegramId }}</strong>
    </p>
  </template>
  <template v-else>
    <p class="text-sm text-muted-foreground">Telegram ID: Not connected</p>
    <Button @click="generate()" :disabled="loading"> Connect Telegram </Button>
  </template>
</template>
