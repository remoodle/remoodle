import { deleteCookie, getCookie, getRequestUrl, setCookie } from "@tanstack/react-start/server";

// `__Host-` binds a cookie to this exact origin, but requires `Secure`, which plain-HTTP local
// development cannot set in every browser. The prefix is therefore dropped only off HTTPS.
function cookie(name: string) {
  const secure = getRequestUrl().protocol === "https:";

  return {
    name: secure ? `__Host-${name}` : name,
    options: { httpOnly: true, secure, sameSite: "lax", path: "/" } as const,
  };
}

// The remoodle session token. Only server functions read it; the browser never sees its value.
const session = () => cookie("remoodle-session");

// The secret that redeems a pending Telegram sign-in, kept out of client JavaScript too.
const signIn = () => cookie("remoodle-sign-in");

function secondsUntil(time: number) {
  return Math.max(0, Math.floor((time - Date.now()) / 1000));
}

export function readSessionToken() {
  return getCookie(session().name);
}

export function writeSessionToken(token: string, expiresAt: number) {
  const { name, options } = session();

  setCookie(name, token, { ...options, maxAge: secondsUntil(expiresAt) });
}

export function clearSessionToken() {
  const { name, options } = session();

  deleteCookie(name, options);
}

export function readSignInSecret() {
  return getCookie(signIn().name);
}

export function writeSignInSecret(pollSecret: string, expiresAt: number) {
  const { name, options } = signIn();

  setCookie(name, pollSecret, { ...options, maxAge: secondsUntil(expiresAt) });
}

export function clearSignInSecret() {
  const { name, options } = signIn();

  deleteCookie(name, options);
}
