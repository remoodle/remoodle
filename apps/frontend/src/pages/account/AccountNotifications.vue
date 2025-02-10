<script setup lang="ts">
import { ref, reactive, toRef, watch, onMounted, watchEffect } from "vue";
import { useMutation } from "@tanstack/vue-query";
import type { NotificationSettings } from "@remoodle/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Checkbox } from "@/shared/ui/checkbox";
import { Separator } from "@/shared/ui/separator";
import { useToast } from "@/shared/ui/toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { requestUnwrap, getAuthHeaders } from "@/shared/lib/hc";
import { useUserStore } from "@/shared/stores/user";
import { TELEGRAM_BOT_URL } from "@/shared/config";

const props = defineProps<{
  account: {
    telegramId?: number;
    notificationSettings: NotificationSettings;
  };
}>();

const { toast } = useToast();

const userStore = useUserStore();

const notificationSettings = ref<NotificationSettings>(
  JSON.parse(JSON.stringify(props.account.notificationSettings)),
);

const telegramId = ref<number | undefined>(props.account?.telegramId);
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
    mutationFn: async (notificationSettings: NotificationSettings) =>
      requestUnwrap((client) =>
        client.v2.user.settings.$post(
          {
            json: {
              notificationSettings,
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
  notificationSettings,
  (value) => {
    updateNotifications(value);
  },
  { deep: true },
);

const AVAILABLE_THRESHOLDS = [
  "1 hour",
  "3 hours",
  "6 hours",
  "12 hours",
  "1 day",
  "2 days",
  "3 days",
  "4 days",
];
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
    <template v-if="telegramId">
      <p class="text-sm text-muted-foreground">
        Connected to Telegram ID: <strong>{{ telegramId }}</strong>
      </p>
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

  <section>
    <Table class="max-w-2xl">
      <TableHeader>
        <TableRow>
          <TableHead class="w-[420px]"> </TableHead>
          <TableHead class="text-right"> Telegram </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell class="font-medium"> 📘 Updated grades </TableCell>
          <TableCell class="text-right">
            <Switch
              :checked="
                !telegramId
                  ? false
                  : notificationSettings['gradeUpdates::telegram'] === 1
              "
              @update:checked="
                (value) =>
                  (notificationSettings['gradeUpdates::telegram'] = value
                    ? 1
                    : 0)
              "
              :disabled="!telegramId || updatingNotifications"
            />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell class="font-medium">
            🔔 Upcoming deadlines

            <div
              class="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-4 md:gap-x-6 md:gap-y-4"
            >
              <template
                v-for="threshold in AVAILABLE_THRESHOLDS"
                :key="threshold"
              >
                <div class="flex flex-col gap-4">
                  <div class="flex items-center space-x-2">
                    <Checkbox
                      :id="threshold"
                      :checked="
                        telegramId
                          ? notificationSettings.deadlineThresholds.includes(
                              threshold,
                            )
                          : false
                      "
                      :disabled="
                        !telegramId ||
                        updatingNotifications ||
                        notificationSettings['deadlineReminders::telegram'] ===
                          0
                      "
                      @update:checked="
                        (value) =>
                          (notificationSettings.deadlineThresholds = value
                            ? [
                                ...notificationSettings.deadlineThresholds,
                                threshold,
                              ]
                            : notificationSettings.deadlineThresholds.filter(
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
                </div>
              </template>
            </div>
          </TableCell>
          <TableCell class="text-right">
            <Switch
              :checked="
                !telegramId
                  ? false
                  : notificationSettings['deadlineReminders::telegram'] === 1
              "
              @update:checked="
                (value) =>
                  (notificationSettings['deadlineReminders::telegram'] = value
                    ? 1
                    : 0)
              "
              :disabled="!telegramId || updatingNotifications"
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </section>
</template>
