<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { useUserStore } from "@/shared/stores/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";
import { isEmptyString } from "@/shared/lib/helpers";
import { requestUnwrap, getAuthHeaders } from "@/shared/lib/hc";
import { useToast } from "@/shared/ui/toast";
import { features } from "@/shared/config/features";

const AccountDeletion = defineAsyncComponent(
  () => import("./ui/AccountDeletion.vue"),
);

const { toast } = useToast();

const userStore = useUserStore();

const props = defineProps<{
  account: {
    hasPassword: boolean;
    handle: string;
    name: string;
  };
}>();

const initialHandle = ref(props.account.handle || "");
const handle = ref<string>(`${initialHandle.value}`);

const MAX_HANDLE_LENGTH = 20;
const canUpdateHandle = computed(() => {
  if (updatingHandle.value) {
    return true;
  }

  const USERNAME_REGEX = new RegExp(`^.{1,${MAX_HANDLE_LENGTH}}$`);

  return (
    !handle.value.match(USERNAME_REGEX) ||
    isEmptyString(handle.value) ||
    handle.value === initialHandle.value
  );
});

const { mutate: updateHandle, isPending: updatingHandle } = useMutation({
  mutationFn: async () =>
    requestUnwrap((client) =>
      client.v2.user.settings.$post(
        { json: { handle: handle.value } },
        { headers: getAuthHeaders() },
      ),
    ),
  onSuccess: (data) => {
    initialHandle.value = handle.value;

    if (userStore.user) {
      userStore.user.handle = handle.value;
    }
  },
  onError: (error) => {
    toast({
      title: error.message,
    });
  },
});

const hasPassword = ref(props.account.hasPassword);

const showPasswordDialog = ref(false);
const currentPassword = ref<string>("");
const newPassword = ref<string>("");

const resetPasswordFields = () => {
  currentPassword.value = "";
  newPassword.value = "";
};

const canUpdatePassword = computed(() => {
  if (updatingPassword.value) {
    return true;
  }

  return isEmptyString(newPassword.value);
});

const { mutate: updatePassword, isPending: updatingPassword } = useMutation({
  mutationFn: async () =>
    requestUnwrap((client) =>
      client.v2.user.settings.$post(
        { json: { password: newPassword.value } },
        { headers: getAuthHeaders() },
      ),
    ),
  onSuccess: (data) => {
    resetPasswordFields();

    showPasswordDialog.value = false;
    hasPassword.value = true;

    toast({
      title: "Password updated",
    });
  },
  onError: (error) => {
    toast({
      title: error.message,
    });
  },
});
</script>

<template>
  <div>
    <h1 class="text-xl font-medium">Profile</h1>
    <p class="text-sm text-muted-foreground">Account information</p>
  </div>
  <Separator />
  <form @submit.prevent="updateHandle()">
    <div class="grid gap-2">
      <Label for="name">Handle</Label>
      <Input
        v-model="handle"
        placeholder="user-177"
        id="name"
        type="string"
        auto-capitalize="none"
        auto-correct="off"
        :maxlength="MAX_HANDLE_LENGTH"
        :disabled="updatingHandle"
        required
      />
    </div>
    <div class="py-2"></div>
    <Button type="submit" :disabled="canUpdateHandle">Save</Button>
  </form>

  <Separator />

  <div class="grid gap-2">
    <Label for="password">Password</Label>
    <div>
      <Dialog
        v-model:open="showPasswordDialog"
        @update:open="
          (value) => {
            if (!value) {
              resetPasswordFields();
            }
          }
        "
      >
        <DialogTrigger>
          <Button variant="outline">
            {{ hasPassword ? "Change" : "Set" }} password
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {{ hasPassword ? "Change" : "Set" }} password
            </DialogTitle>
            <DialogDescription>
              <p class="break-words" v-if="!hasPassword">
                for <strong>{{ account.handle }}</strong>
              </p>
            </DialogDescription>
          </DialogHeader>

          <form @submit.prevent="updatePassword()" class="space-y-6">
            <div class="grid gap-2">
              <Label for="user_new_password">New password</Label>
              <Input
                v-model="newPassword"
                id="user_new_password"
                placeholder="••••••••••••"
                type="password"
                passwordrules="minlength: 15; allowed: unicode;"
                autocomplete="off"
                spellcheck="false"
                :disabled="updatingPassword"
                required
              />
            </div>

            <DialogFooter class="sm:justify-start">
              <Button type="submit" :disabled="canUpdatePassword">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  <Separator />

  <AccountDeletion v-if="features.enableAccountDeletion" />
</template>
