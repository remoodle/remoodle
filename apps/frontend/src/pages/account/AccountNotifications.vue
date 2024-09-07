<script setup lang="ts">
import { ref, watch } from "vue";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Separator } from "@/shared/ui/separator";
import { useToast } from "@/shared/ui/toast";
import { request, getAuthHeaders } from "@/shared/lib/hc";
import { createAsyncProcess } from "@/shared/lib/helpers";
import { useUserStore } from "@/shared/stores/user";
import { TELEGRAM_BOT_URL } from "@/shared/config";

const props = defineProps<{
  settings: {
    telegramId?: number;
    notifications: {
      telegram: {
        enabled: boolean;
        gradeUpdates: boolean;
        deadlineReminders: boolean;
      };
    };
  };
}>();

const { toast } = useToast();

const userStore = useUserStore();

const notifications = ref(props.settings.notifications);

const telegramId = ref<number | undefined>(props.settings?.telegramId);
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

const { run: updateNotifications, loading: updatingNotifications } =
  createAsyncProcess(async () => {
    const [_, error] = await request((client) =>
      client.v1.user.settings.$post(
        {
          json: {
            telegramDeadlineReminders:
              notifications.value.telegram.deadlineReminders,
            telegramGradeUpdates: notifications.value.telegram.gradeUpdates,
          },
        },
        {
          headers: getAuthHeaders(),
        },
      ),
    );

    if (error) {
      throw error;
    }
  });

watch(
  notifications,
  () => {
    updateNotifications();
  },
  { deep: true },
);
</script>

<template>
  <div>
    <h1 class="text-xl font-medium">Notifications</h1>
    <p class="text-sm text-muted-foreground">
      Configure how you receive notifications
    </p>
  </div>
  <Separator />

  <div>
    <h2 class="mb-4 text-lg font-medium">Telegram Notifications</h2>
    <template v-if="telegramId">
      <p class="text-sm text-muted-foreground">
        Connected to Telegram ID: <strong>{{ telegramId }}</strong>
      </p>
      <div class="py-3"></div>
      <div class="flex flex-col gap-6">
        <div class="flex items-center space-x-2">
          <Switch
            :checked="notifications.telegram.deadlineReminders"
            :disabled="updatingNotifications"
            @update:checked="
              (value) => (notifications.telegram.deadlineReminders = value)
            "
            id="deadlineReminders"
          />
          <Label for="deadlineReminders">Deadline reminders</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Switch
            :checked="notifications.telegram.gradeUpdates"
            :disabled="updatingNotifications"
            @update:checked="
              (value) => (notifications.telegram.gradeUpdates = value)
            "
            id="gradeUpdates"
          />
          <Label for="gradeUpdates">Grade updates</Label>
        </div>
      </div>
    </template>
    <template v-else>
      <p class="text-sm text-muted-foreground">Telegram ID: Not connected</p>
      <template v-if="editingMode">
        <form @submit.prevent="verify()">
          <div class="flex max-w-sm items-center gap-2">
            <Input
              v-model="otp"
              :disabled="loading"
              placeholder="Telegram OTP"
            />
            <Button type="submit" :disabled="loading"> Verify </Button>
          </div>
        </form>
      </template>
      <template v-else>
        <Button @click="connect"> Connect Telegram </Button>
      </template>
    </template>
  </div>
</template>
