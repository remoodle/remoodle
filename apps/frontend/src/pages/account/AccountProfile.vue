<script setup lang="ts">
import { ref, computed } from "vue";
import type { UserSettings } from "@remoodle/types";
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
import { createAsyncProcess, isEmptyString } from "@/shared/utils";
import { api } from "@/shared/api";
import { useToast } from "@/shared/ui/toast";

const { toast } = useToast();

const userStore = useUserStore();

const props = defineProps<{
  settings: {
    hasPassword: boolean;
    handle: string;
    name: string;
  };
}>();

const hasPassword = ref(props.settings.hasPassword);

const initialHandle = ref(props.settings.handle || "");
const handle = ref<string>(`${initialHandle.value}`);
const { run: updateHandle, loading: updatingHandle } = createAsyncProcess(
  async () => {
    const [_, error] = await api.updateUserSettings({
      handle: handle.value,
    });

    if (error) {
      toast({
        title: error.message,
      });
      throw error;
    }

    initialHandle.value = handle.value;

    toast({
      title: "Handle updated",
    });
  },
);
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

const showPasswordDialog = ref(false);
const currentPassword = ref<string>("");
const newPassword = ref<string>("");
const resetPasswordFields = () => {
  currentPassword.value = "";
  newPassword.value = "";
};
const { run: updatePassword, loading: updatingPassword } = createAsyncProcess(
  async () => {
    const [_, error] = await api.updateUserSettings({
      password: newPassword.value,
    });

    if (error) {
      toast({
        title: error.message,
      });
      throw error;
    }

    resetPasswordFields();

    showPasswordDialog.value = false;
    hasPassword.value = true;

    toast({
      title: "Password updated",
    });
  },
);
const canUpdatePassword = computed(() => {
  if (updatingPassword.value) {
    return true;
  }

  return isEmptyString(newPassword.value);
});

const { run: deleteAccount, loading: deletingAccount } = createAsyncProcess(
  async () => {
    const [_, error] = await api.deleteUser();

    if (error) {
      toast({
        title: error.message,
      });
      throw error;
    }

    console.log(_);

    toast({
      title: "Account deleted",
    });

    userStore.logout();
  },
);
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">Profile</h3>
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
                for <strong>{{ settings.handle }}</strong>
              </p>
            </DialogDescription>
          </DialogHeader>

          <form @submit.prevent="updatePassword()" class="space-y-6">
            <!-- <div class="grid gap-2">
              <Label for="user_old_password">Current password</Label>
              <Input
                v-model="currentPassword"
                id="user_old_password"
                placeholder="••••••••••••"
                type="password"
                autocomplete="current-password"
                spellcheck="false"
                :disabled="updatingPassword"
                required
              />
            </div> -->
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

  <details>
    <summary>
      <span> Manage your data </span>
    </summary>
    <p class="my-1 text-muted-foreground">
      This will delete your user account, all data and everything else that goes
      with it.
    </p>
    <div class="mt-3">
      <Dialog>
        <DialogTrigger as-child>
          <Button variant="destructive"> Delete account </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Account </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter class="sm:justify-start">
            <DialogClose as-child>
              <Button type="button" variant="outline"> Cancel </Button>
            </DialogClose>

            <Button
              type="button"
              variant="destructive"
              :disabled="deletingAccount"
              @click="deleteAccount"
            >
              Yes, delete my account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </details>
</template>
