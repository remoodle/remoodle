<script setup lang="ts">
import { ref, reactive, toRefs, watch } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Checkbox } from "@/shared/ui/checkbox";
import { Separator } from "@/shared/ui/separator";
import { useToast } from "@/shared/ui/toast";
import { requestUnwrap, getAuthHeaders } from "@/shared/lib/hc";
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
      deadlineThresholds: string[];
    };
  };
}>();

const { toast } = useToast();

const userStore = useUserStore();

const { notifications } = toRefs(props.settings);

const telegramId = ref<number | undefined>(props.settings?.telegramId);
const editingMode = ref(false);
const otp = ref<string>("");

const connect = () => {
  editingMode.value = true;
  window.open(`${TELEGRAM_BOT_URL}?start=connect`, "_blank");
};

const { mutate: verify, isPending: verifying } = useMutation({
  mutationFn: async () =>
    requestUnwrap((client) =>
      client.v2.otp.verify.$post(
        { json: { otp: otp.value } },
        { headers: getAuthHeaders() },
      ),
    ),
  onSuccess: (data) => {
    editingMode.value = false;
    otp.value = "";

    telegramId.value = parseInt(data.telegramId);

    userStore.closeTelegramBanner();

    toast({
      title: "Telegram connected",
    });
  },
  onError: (error) => {
    toast({
      title: error.message,
    });
  },
});

const { mutate: updateNotifications, isPending: updatingNotifications } =
  useMutation({
    mutationFn: async () =>
      requestUnwrap((client) =>
        client.v2.user.settings.$post(
          {
            json: {
              telegramDeadlineReminders:
                notifications.value.telegram.deadlineReminders,
              telegramGradeUpdates: notifications.value.telegram.gradeUpdates,
              deadlineThresholds: notifications.value.deadlineThresholds,
            },
          },
          { headers: getAuthHeaders() },
        ),
      ),
    onError: (error) => {
      toast({
        title: error.message,
      });
    },
  });

watch(
  notifications,
  () => {
    updateNotifications();
  },
  { deep: true },
);

const THRESHOLDS = {
  HOUR_THRESHOLDS: ["1 hour", "3 hours", "6 hours", "12 hours"],
  DAY_THRESHOLDS: ["1 day", "2 days", "3 days", "4 days"],
};
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

      <div class="flex flex-col gap-8">
        <div class="flex flex-col gap-3">
          <span class="text-lg font-medium">Grades</span>
          <div class="flex items-center space-x-2">
            <Switch
              v-model:checked="notifications.telegram.gradeUpdates"
              :disabled="updatingNotifications"
              id="gradeUpdates"
            />
            <Label for="gradeUpdates">Telegram updates</Label>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <span class="text-lg font-medium">Deadlines</span>
          <div class="flex items-center space-x-2">
            <Switch
              v-model:checked="notifications.telegram.deadlineReminders"
              :disabled="updatingNotifications"
              id="deadlineReminders"
            />
            <Label for="deadlineReminders">Telegram reminders</Label>
          </div>
          <div class="py-0.5"></div>
          <div class="flex flex-row gap-x-16">
            <template
              v-for="[key, value] in Object.entries(THRESHOLDS)"
              :key="key"
            >
              <div class="flex flex-col gap-4">
                <template v-for="threshold in value" :key="threshold">
                  <div class="flex items-center space-x-2">
                    <Checkbox
                      :id="threshold"
                      :checked="
                        notifications.deadlineThresholds.includes(threshold)
                      "
                      :disabled="
                        updatingNotifications ||
                        !notifications.telegram.deadlineReminders
                      "
                      @update:checked="
                        (value) =>
                          (notifications.deadlineThresholds = value
                            ? [...notifications.deadlineThresholds, threshold]
                            : notifications.deadlineThresholds.filter(
                                (t) => t !== threshold,
                              ))
                      "
                    />
                    <label
                      :for="threshold"
                      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {{ threshold }}
                    </label>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <p class="text-sm text-muted-foreground">Telegram ID: Not connected</p>
      <div class="py-2" />
      <template v-if="editingMode">
        <form @submit.prevent="verify()">
          <div class="flex max-w-sm items-center gap-2">
            <Input
              v-model="otp"
              :disabled="verifying"
              placeholder="Telegram OTP"
            />
            <Button type="submit" :disabled="verifying"> Verify </Button>
          </div>
        </form>
      </template>
      <template v-else>
        <Button @click="connect"> Connect Telegram </Button>
      </template>
    </template>
  </div>
</template>
