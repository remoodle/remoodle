import { computed } from "vue";
import { defineStore } from "pinia";
import { useStorage, StorageSerializers } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";
import type { IUser } from "@remoodle/types";
import { getStorageKey } from "@/shared/lib/helpers";
import { createAsyncProcess } from "@/shared/lib/helpers";
import { request, getAuthHeaders } from "@/shared/lib/hc";

export const useUserStore = defineStore("user", () => {
  const accessToken = useStorage(getStorageKey("accessToken"), "");
  const refreshToken = useStorage(getStorageKey("refreshToken"), "");

  const user: RemovableRef<IUser | undefined> = useStorage(
    getStorageKey("user"),
    null,
    undefined,
    { serializer: StorageSerializers.object },
  );

  const authorized = computed(() => {
    return !!user.value && !!accessToken.value && !!refreshToken.value;
  });

  const login = (
    accessTokenData: string,
    refreshTokenData: string,
    userData: IUser,
  ) => {
    accessToken.value = accessTokenData;
    refreshToken.value = refreshTokenData;
    user.value = userData;
  };

  const defaultPreferences = Object.freeze({
    toggledCourseCategories: [] as string[],
  });

  const getDefaultPreferences = () => {
    return Object.assign({}, defaultPreferences);
  };

  const preferences = useStorage(
    getStorageKey("user-preferences", 1.1),
    getDefaultPreferences(),
  );

  const showTelegramBanner = useStorage(
    getStorageKey("telegram-notifications-banner"),
    true,
  );

  const closeTelegramBanner = () => {
    showTelegramBanner.value = false;
  };

  const logout = () => {
    user.value = null;
    accessToken.value = "";
    refreshToken.value = "";

    preferences.value = getDefaultPreferences();

    showTelegramBanner.value = true;
  };

  const { run: updateUser, loading: updatingUser } = createAsyncProcess(
    async () => {
      const [data, error] = await request((client) =>
        client.v1.user.check.$get(
          {},
          {
            headers: getAuthHeaders(),
          },
        ),
      );

      if (error) {
        if (error.status === 401) {
          logout();
        }

        return;
      }

      user.value = data;
    },
  );

  return {
    user,
    preferences,
    accessToken,
    refreshToken,
    authorized,
    login,
    logout,
    showTelegramBanner,
    closeTelegramBanner,
    updateUser,
    updatingUser,
  };
});
