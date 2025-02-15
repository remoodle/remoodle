<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { useUserStore } from "@/shared/stores/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { useLogout } from "@/shared/lib/use-logout";
import { Button } from "@/shared/ui/button";
import { requestUnwrap, getAuthHeaders } from "@/shared/lib/hc";
import { useToast } from "@/shared/ui/toast";

const { toast } = useToast();

const { logout } = useLogout();

const { mutate: deleteAccount, isPending: deletingAccount } = useMutation({
  mutationFn: async () =>
    requestUnwrap((client) =>
      client.v2.bye.$delete({}, { headers: getAuthHeaders() }),
    ),
  onSuccess: () => {
    toast({
      title: "Account deleted",
    });

    logout();
  },
  onError: (error) => {
    toast({
      title: error.message,
    });
  },
});
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
      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button variant="destructive"> Delete account </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction @click="deleteAccount">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </details>
</template>
