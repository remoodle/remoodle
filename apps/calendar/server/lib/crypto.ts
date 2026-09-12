// Secrets are encrypted at rest, bound to their owner, and never returned to the UI.
async function key(secret: string) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "HKDF",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("my-du-v1"),
      info: new TextEncoder().encode("credentials"),
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSecret(value: string, secret: string, userId: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(userId) },
    await key(secret),
    new TextEncoder().encode(value),
  );

  const encrypted = new Uint8Array(data);
  const payload = new Uint8Array(iv.length + encrypted.length);
  payload.set(iv);
  payload.set(encrypted, iv.length);
  let encoded = "";

  for (let index = 0; index < payload.length; index++) {
    encoded += String.fromCharCode(payload[index]!);
  }

  return btoa(encoded);
}

export async function decryptSecret(value: string, secret: string, userId: string) {
  const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

  const data = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: bytes.slice(0, 12), additionalData: new TextEncoder().encode(userId) },
    await key(secret),
    bytes.slice(12),
  );

  return new TextDecoder().decode(data);
}
