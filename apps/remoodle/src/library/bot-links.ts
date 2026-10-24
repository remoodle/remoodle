import { config } from "../config";

// `/start` payloads. The web calendar sends users to the bot for everything it cannot do itself.
export const START_PAYLOADS = { myDu: "my_du", moodle: "moodle", loginPrefix: "login_" } as const;

export function botStartUrl(payload: string) {
  return `${config.telegram.url}?start=${payload}`;
}
