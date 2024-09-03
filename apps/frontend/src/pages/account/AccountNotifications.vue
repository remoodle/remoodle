<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { useToast } from "@/shared/ui/toast";
import { request, getAuthHeaders } from "@/shared/lib/hc";
import { createAsyncProcess } from "@/shared/lib/helpers";
import { useUserStore } from "@/shared/stores/user";
import { telegram } from "@/shared/config";

const props = defineProps<{
  settings: {
    telegramId?: number | undefined;
  };
}>();

const userStore = useUserStore();

const telegramId = ref<number | undefined>(props.settings?.telegramId);

const { toast } = useToast();

const TELEGRAM_BOT_URL = `https://t.me/${telegram.bot}`;

const editingMode = ref(false);

const otp = ref<string>("");

const connect = () => {
  editingMode.value = true;
  window.open(`${TELEGRAM_BOT_URL}?start=connect`, "_blank");
};

const { run: verify, loading } = createAsyncProcess(async () => {
  const [data, error] = await request((client) =>
    client.v1.otp.verify.$post(
      {
        json: {
          otp: otp.value,
        },
      },
      {
        headers: getAuthHeaders(),
      },
    ),
  );

  editingMode.value = false;
  otp.value = "";

  if (error) {
    toast({
      title: error.message,
    });
    throw error;
  }

  telegramId.value = parseInt(data.telegramId);

  userStore.closeTelegramBanner();

  toast({
    title: "Telegram connected",
  });
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

  <template v-if="telegramId">
    <p class="text-sm text-muted-foreground">
      Telegram ID: <strong>{{ telegramId }}</strong>
    </p>
  </template>
  <template v-else>
    <p class="text-sm text-muted-foreground">Telegram ID: Not connected</p>
    <template v-if="editingMode">
      <form @submit.prevent="verify()">
        <div class="flex max-w-sm items-center gap-2">
          <Input v-model="otp" :disabled="loading" placeholder="Telegram OTP" />
          <Button type="submit" :disabled="loading"> Verify </Button>
        </div>
      </form>
    </template>
    <template v-else>
      <Button @click="connect"> Connect Telegram </Button>
    </template>
  </template>
</template>
