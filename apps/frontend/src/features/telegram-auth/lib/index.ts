import type { TelegramUser } from "@remoodle/types";

export type OnTelegramAuth = (_user: TelegramUser) => void;
