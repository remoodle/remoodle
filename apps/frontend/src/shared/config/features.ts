import { reactive } from "vue";

export const features = reactive({
  enableTokenAuth: !import.meta.env.PROD,
  enableAccountDeletion: !import.meta.env.PROD,
});
