import type { TelegramUser } from "@remoodle/types";

export type OnTelegramAuth = (user: TelegramUser) => void;
