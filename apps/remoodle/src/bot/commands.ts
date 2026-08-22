import type { BotCommand } from "grammy/types";
import { m } from "../library/i18n/messages.js";

export const BOT_COMMANDS: BotCommand[] = [
  { command: "start", description: m.command_open_menu() },
  { command: "deadlines", description: m.command_show_deadlines() },
  { command: "ds", description: m.command_show_deadlines_short() },
  { command: "d", description: m.command_show_deadlines() },
  { command: "today", description: m.command_show_today_schedule() },
  { command: "schedule", description: m.command_show_next_week_schedule() },
  { command: "settings", description: m.command_open_settings() },
  { command: "update", description: m.command_update_calendar_url() },
];
