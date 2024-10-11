import { reactive } from "vue";

const enableByDefault =
  import.meta.env.MODE === "staging" || import.meta.env.DEV;

export const features = reactive({
  enableTokenAuth: enableByDefault,
  enableAccountDeletion: enableByDefault,
});
