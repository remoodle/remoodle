import posthog from "posthog-js";
import { IS_PROD } from "@/shared/config";

export const useAnalytics = () => {
  posthog.init(
    IS_PROD ? "phc_cfpLe4cOVjX1vTJLFU2Xdf63XmT0kqEfRBpYxYmEVoi" : "gagr",
    {
      api_host: "https://us.i.posthog.com",
      autocapture: true,
      loaded: function (ph) {
        if (!IS_PROD) {
          ph.opt_out_capturing();
          ph.set_config({ disable_session_recording: true });
        }
      },
    },
  );

  return {
    posthog,
  };
};
