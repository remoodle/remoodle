<script setup lang="ts">
import { ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { cn } from "@/shared/lib/helpers";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Link } from "@/shared/ui/link";
import { useToast } from "@/shared/ui/toast/use-toast";
import { requestUnwrap } from "@/shared/lib/hc";
import { vFocus } from "@/shared/lib/helpers";
import { EXTERNAL } from "@/shared/config";
import { useUserStore } from "@/shared/stores/user";

const userStore = useUserStore();

const form = ref({
  token: "",
});

const { toast } = useToast();

const { mutate: submit, isPending } = useMutation({
  mutationFn: async () =>
    requestUnwrap((client) =>
      client.v2.auth.token.$post({
        json: { moodleToken: form.value.token },
      }),
    ),
  onSuccess: (data) => {
    userStore.login(data.accessToken, data.refreshToken, data.user);
  },
  onError: (error) => {
    toast({
      title: error.message,
    });
  },
});
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form @submit.prevent="submit()">
      <div class="grid gap-5">
        <div class="grid gap-3">
          <div class="grid gap-1.5">
            <Label for="token"> Moodle Token </Label>
            <Input
              v-focus
              v-model="form.token"
              placeholder="5f7a16ff7204ecb9bcd16bf0125d79d9"
              id="token"
              type="password"
              auto-capitalize="none"
              auto-correct="off"
              :disabled="isPending"
              required
            />
            <Link
              class="text-sm text-muted-foreground"
              :to="EXTERNAL.how_to_find_token"
              hover
            >
              Where to find a Moodle Token?
            </Link>
          </div>
        </div>
        <Button :disabled="isPending"> Continue </Button>
      </div>
    </form>
  </div>
</template>
