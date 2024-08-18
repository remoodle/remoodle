import { createClient } from "@remoodle/backend";
import { useUserStore } from "@/shared/stores/user";

const { request } = createClient("http://localhost:9000/");

const getAuthHeaders = () => {
  const userStore = useUserStore();

  return {
    Authorization: `Bearer ${userStore.accessToken}`,
  };
};

export { request, getAuthHeaders };
