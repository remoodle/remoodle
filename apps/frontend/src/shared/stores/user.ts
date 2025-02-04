import { computed, watchEffect } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { defineStore } from "pinia";
import { useStorage, StorageSerializers } from "@vueuse/core";
import type { RemovableRef } from "@vueuse/core";
import type { APIError, IUser } from "@remoodle/types";
import { getStorageKey } from "@/shared/lib/helpers";
import { requestUnwrap, getAuthHeaders } from "@/shared/lib/hc";

export function useUser(token: string) {
  const {
    isPending,
    isError,
    data,
    error,
    refetch: updateUser,
  } = useQuery<IUser, APIError>({
    queryKey: ["user"],
    queryFn: async () =>
      await requestUnwrap((client) =>
        client.v2.user.check.$get({}, { headers: getAuthHeaders(token) }),
      ),
  });

  return { data, isPending, error };
}

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

  const { data, isPending, error } = useUser(accessToken.value);

  watchEffect(() => {
    if (data.value) {
      user.value = data.value;
    }

    if (error.value && error.value.status === 401) {
      logout();
    }
  });

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
  };
});
