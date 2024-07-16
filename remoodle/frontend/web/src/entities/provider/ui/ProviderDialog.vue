<script setup lang="ts">
import { ref } from "vue";
import { objectEntries } from "@/shared/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/shared/ui/dialog";
import type { Providers, Provider } from "@/shared/types";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Icon } from "@/shared/ui/icon";
import { Button } from "@/shared/ui/button";
import { RadioGroup } from "@/shared/ui/radio-group";
import ProviderCard from "./ProviderCard.vue";

defineModel<string | undefined>("providerId", {
  required: true,
});

defineModel<Providers>("providers", {
  required: true,
});

type TempProvider = Provider & { id: string };

const editingMode = ref(false);

const defaultProvider: TempProvider = Object.freeze({
  id: "",
  name: "",
  description: "",
  api: "",
  privacy: "",
  static: false,
  moodle: {
    requiresTokenGeneration: false,
  },
});

const getDefaults = () => Object.assign({}, defaultProvider);

const tempProvider = ref<TempProvider>(getDefaults());

const resetTempProvider = () => {
  Object.assign(tempProvider.value, getDefaults());
};

const generateId = (name: string) => {
  return name.toLowerCase().replace(/\s/g, "-") + "-" + new Date().getTime();
};

const showProviderModal = ref(false);
</script>

<template>
  <Dialog>
    <DialogTrigger>
      <slot
        :selected-provider="providerId ? providers[providerId] : undefined"
      ></slot>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select API Provider</DialogTitle>
        <DialogDescription>
          You can change the API provider to connect to a different server
        </DialogDescription>
        <div class="py-1" />
        <RadioGroup
          class="flex flex-col space-y-3"
          :model-value="providerId"
          @update:model-value="$emit('update:providerId', $event)"
        >
          <template v-for="[k, v] in objectEntries(providers)" :key="k">
            <div class="flex items-center justify-between gap-2">
              <ProviderCard :id="k" :provider="v" />
              <div class="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  @click="
                    () => {
                      tempProvider = Object.assign({}, v, { id: k });
                      showProviderModal = true;
                      editingMode = true;
                    }
                  "
                >
                  <Icon name="edit" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  @click="
                    () => {
                      const { [k]: _, ...rest } = providers;
                      $emit('update:providers', rest);
                    }
                  "
                >
                  <Icon name="delete" />
                </Button>
              </div>
            </div>
          </template>
        </RadioGroup>
        <div class="py-1" />
        <DialogFooter class="sm:justify-start">
          <Dialog
            v-model:open="showProviderModal"
            @update:open="
              (value) => {
                if (!value) {
                  resetTempProvider();
                  editingMode = false;
                }
              }
            "
          >
            <DialogTrigger>
              <Button
                variant="outline"
                size="icon"
                @click="editingMode = false"
              >
                <Icon name="add" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {{ editingMode ? "Edit" : "Add" }} Provider
                </DialogTitle>
                <DialogDescription>
                  Fill in the details carefully
                </DialogDescription>
                <form
                  @submit.prevent="
                    () => {
                      const id = generateId(tempProvider.name);

                      if (editingMode) {
                        $emit('update:providers', {
                          ...providers,
                          [tempProvider.id]: Object.assign({}, tempProvider),
                        });
                      } else {
                        $emit('update:providers', {
                          ...providers,
                          [id]: Object.assign({}, tempProvider),
                        });
                      }

                      resetTempProvider();
                      showProviderModal = false;
                    }
                  "
                >
                  <div class="grid gap-4">
                    <div class="grid gap-3">
                      <div class="grid gap-1.5">
                        <Label for="name">Name</Label>
                        <Input
                          v-model="tempProvider.name"
                          placeholder="MIT"
                          id="name"
                          type="text"
                          auto-capitalize="none"
                          auto-correct="off"
                          required
                        />
                      </div>
                      <div class="grid gap-1.5">
                        <Label for="api">API</Label>
                        <Input
                          v-model="tempProvider.api"
                          placeholder="localhost"
                          id="api"
                          type="text"
                          auto-capitalize="none"
                          auto-correct="off"
                          required
                        />
                      </div>
                      <div class="grid gap-1.5">
                        <Label for="description">Description (optional)</Label>
                        <Input
                          v-model="tempProvider.description"
                          placeholder="Some experiments"
                          id="description"
                          type="text"
                          auto-capitalize="none"
                          auto-correct="off"
                        />
                      </div>
                      <div class="grid gap-1.5">
                        <Label for="privacy">
                          Privacy Policy (recommended)
                        </Label>
                        <Input
                          v-model="tempProvider.privacy"
                          placeholder="https://example.com/privacy"
                          id="privacy"
                          type="text"
                          auto-capitalize="none"
                          auto-correct="off"
                        />
                      </div>
                    </div>
                    <Button type="submit"> Save </Button>
                  </div>
                </form>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </DialogFooter>
      </DialogHeader>
    </DialogContent>
  </Dialog>
</template>
