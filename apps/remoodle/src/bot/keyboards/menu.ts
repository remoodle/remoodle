import { InlineKeyboard } from "grammy";
import { config } from "../../config";
import { m } from "../../library/i18n/messages.js";
import {
  aboutCallback,
  menuCallback,
  settingsCallback,
  deadlinesCallback,
  scheduleCallback,
} from "../callback-data";

export function buildMenuKeyboard() {
  return new InlineKeyboard()
    .text(m.menu_button_deadlines(), deadlinesCallback.pack({}))
    .text(m.menu_button_schedule(), scheduleCallback.pack({}))
    .row()
    .text(m.ui_settings(), settingsCallback.pack({}))
    .text(m.ui_about(), aboutCallback.pack({}))
    .row()
    .webApp(m.ui_map(), config.aitumap.url)
    .url(m.ui_calendar(), config.calendar.accountUrl);
}

export function buildBackToMenuKeyboard() {
  return new InlineKeyboard().text(m.ui_back(), menuCallback.pack({}));
}
