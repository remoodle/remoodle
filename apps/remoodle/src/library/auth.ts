import * as sessionsRepository from "../db/repositories/sessions";
import * as usersRepository from "../db/repositories/users";
import { hashToken, randomToken } from "./crypto";
import { botStartUrl, START_PAYLOADS } from "./bot-links";

const LOGIN_TTL = 10 * 60_000;

export const SESSION_TTL = 30 * 24 * 60 * 60_000;

type TelegramProfile = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

// The browser keeps `pollSecret`; only `code` travels through Telegram. Someone who sees the
// deep link can approve it but can never receive the resulting session.
export async function startTelegramLogin() {
  // Deep-link payloads allow at most 64 characters of [A-Za-z0-9_-].
  const code = randomToken(24);
  const pollSecret = randomToken();
  const expiresAt = new Date(Date.now() + LOGIN_TTL);

  await sessionsRepository.createLoginRequest(code, hashToken(pollSecret), expiresAt);

  return {
    pollSecret,
    url: botStartUrl(`${START_PAYLOADS.loginPrefix}${code}`),
    expiresAt: expiresAt.getTime(),
  };
}

export async function approveTelegramLogin(code: string, profile: TelegramProfile) {
  const user = await usersRepository.upsertByTelegramId(profile.id, {
    name: [profile.first_name, profile.last_name].filter(Boolean).join(" "),
    username: profile.username ?? null,
  });

  return sessionsRepository.approveLoginRequest(code, user.id);
}

export async function pollTelegramLogin(pollSecret: string) {
  const request = await sessionsRepository.findLoginRequestBySecret(hashToken(pollSecret));

  if (!request) return { status: "expired" as const };

  if (!request.userId) return { status: "pending" as const };

  const userId = await sessionsRepository.consumeLoginRequest(request.code);

  if (!userId) return { status: "expired" as const };

  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL);
  await sessionsRepository.createSession(hashToken(token), userId, expiresAt);

  return { status: "approved" as const, token, expiresAt };
}

export function findSessionUser(token: string) {
  return sessionsRepository.findSessionUser(hashToken(token));
}

export function endSession(token: string) {
  return sessionsRepository.deleteSession(hashToken(token));
}
