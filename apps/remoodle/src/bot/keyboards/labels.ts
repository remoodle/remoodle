import { m } from "../../library/i18n/messages.js";

// Button conventions: a setting shows its current value after a colon, and the
// chosen option in a list is marked with a bullet. Buttons carry no emoji.

export function settingLabel(label: string, value: string) {
  return m.ui_setting({ label, value });
}

export function choiceLabel(selected: boolean, label: string) {
  return selected ? m.ui_selected({ label }) : label;
}

export function onOff(enabled: boolean) {
  return enabled ? m.ui_on() : m.ui_off();
}

export function shownHidden(shown: boolean) {
  return shown ? m.ui_shown() : m.ui_hidden();
}
