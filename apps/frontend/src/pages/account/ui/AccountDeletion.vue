<script setup lang="ts">
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
import { Button } from "@/shared/ui/button";
import { createAsyncProcess } from "@/shared/lib/helpers";
import { request, getAuthHeaders } from "@/shared/lib/hc";
import { useToast } from "@/shared/ui/toast";

const { toast } = useToast();

const userStore = useUserStore();

const { run: deleteAccount, loading: deletingAccount } = createAsyncProcess(
  async () => {
    const [_, error] = await request((client) =>
      client.v1.bye.$delete(
        {},
        {
          headers: getAuthHeaders(),
        },
      ),
    );

    if (error) {
      toast({
        title: error.message,
      });
      throw error;
    }

    toast({
      title: "Account deleted",
    });

    userStore.logout();
  },
);
</script>

<template>
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
