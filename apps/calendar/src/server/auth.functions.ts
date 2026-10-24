import { createServerFn } from "@tanstack/react-start";
import { readApi, remoodleApi } from "./remoodle-api.server";
import {
  clearSessionToken,
  clearSignInSecret,
  readSessionToken,
  readSignInSecret,
  writeSessionToken,
  writeSignInSecret,
} from "./session.server";

/** The signed-in user, or `null`, plus the bot links the calendar points to. */
export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const token = readSessionToken();
  const session = await readApi(remoodleApi(token).api.auth.session.$get());

  // An expired or revoked token is useless; drop it so later requests skip the round trip.
  if (token && !session.user) clearSessionToken();

  return session;
});

/**
 * Starts a Telegram sign-in. Only the deep link goes to the browser; the secret that redeems
 * the approval stays in an httpOnly cookie, so a script on the page can never claim the session.
 */
export const startSignIn = createServerFn({ method: "POST" }).handler(async () => {
  const { pollSecret, url, expiresAt } = await readApi(remoodleApi().api.auth.telegram.$post());

  writeSignInSecret(pollSecret, expiresAt);

  return { url, expiresAt };
});

export const pollSignIn = createServerFn({ method: "POST" }).handler(async () => {
  const pollSecret = readSignInSecret();

  if (!pollSecret) return { status: "expired" as const };

  const result = await readApi(
    remoodleApi().api.auth.telegram.poll.$post({ json: { pollSecret } }),
  );

  if (result.status !== "approved") {
    if (result.status === "expired") clearSignInSecret();

    return { status: result.status };
  }

  // Rotate: a session that existed before this sign-in must not outlive it.
  const previous = readSessionToken();

  if (previous) await readApi(remoodleApi(previous).api.auth.logout.$post()).catch(() => {});

  clearSignInSecret();
  writeSessionToken(result.token, result.expiresAt);

  return { status: result.status };
});

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const token = readSessionToken();

  clearSessionToken();

  if (token) await readApi(remoodleApi(token).api.auth.logout.$post());

  return { ok: true };
});
