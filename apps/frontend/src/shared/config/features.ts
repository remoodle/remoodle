import { reactive } from "vue";

const enableByDefault =
  import.meta.env.MODE === "preview" || import.meta.env.DEV;

export const features = reactive({
  enableTokenAuth: enableByDefault,
  enableAccountDeletion: enableByDefault,
});
