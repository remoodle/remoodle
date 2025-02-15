import { useQueryClient } from "@tanstack/vue-query";
import { useUserStore } from "@/shared/stores/user";

export const useLogout = () => {
  const queryClient = useQueryClient();

  const userStore = useUserStore();

  const logout = () => {
    queryClient.removeQueries({ queryKey: ["private"] });

    userStore.logout();
  };

  return { logout };
};
