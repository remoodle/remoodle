<script setup lang="ts">
import { ref } from "vue";
import { cn, isEmptyString } from "@/shared/utils";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useToast } from "@/shared/ui/toast/use-toast";
import { api } from "@/shared/api";
import { createAsyncProcess, vFocus } from "@/shared/utils";
import { useUserStore } from "@/shared/stores/user";

const userStore = useUserStore();

const form = ref({
  // email: "",
  name: "",
  password: "",
  token: "",
});

const { toast } = useToast();

const { run: submit, loading } = createAsyncProcess(async () => {
  const [data, error] = await api.register({
    token: form.value.token,
    ...(!isEmptyString(form.value.password) && {
      password: form.value.password,
    }),
    ...(!isEmptyString(form.value.name) && {
      name_alias: form.value.name,
    }),
  });

  if (error) {
    toast({
      title: error.message,
    });
    throw error;
  }

  userStore.login(form.value.token, data);
});
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form @submit.prevent="submit">
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
              :disabled="loading"
              required
            />
            <span class="text-sm text-muted-foreground">
              Where to find a Moodle Token?
            </span>
          </div>
          <div class="grid gap-1.5">
            <Label for="name">Username (recommended)</Label>
            <Input
              v-model="form.name"
              placeholder="messi2009"
              id="name"
              type="text"
              autocomplete="username"
              auto-capitalize="none"
              auto-correct="off"
              :disabled="loading"
            />
          </div>
          <!-- <div class="grid gap-1.5">
            <Label for="email">Email</Label>
            <Input
              v-focus
              v-model="form.email"
              placeholder="name@example.com"
              id="email"
              type="email"
              autocomplete="email"
              auto-capitalize="none"
              auto-correct="off"
              :disabled="loading"
            />
          </div> -->
          <div class="grid gap-1.5">
            <Label for="password">Password (recommended)</Label>
            <Input
              v-model="form.password"
              placeholder="123123123"
              id="password"
              type="password"
              auto-capitalize="none"
              auto-correct="off"
              :disabled="loading"
            />
          </div>
        </div>
        <Button :disabled="loading || isEmptyString(form.token)">
          Create Account
        </Button>
      </div>
    </form>
  </div>
</template>
