import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from "node:crypto";

type SecretContext = {
  key: string;
  // Separates keys per kind of secret.
  purpose: string;
  // Binds the ciphertext to its owner, so a row copied to another user cannot be decrypted.
  owner: string;
};

function deriveKey({ key, purpose }: SecretContext) {
  return Buffer.from(hkdfSync("sha256", key, "remoodle", purpose, 32));
}

export function encryptSecret(value: string, context: SecretContext) {
  const iv = randomBytes(12);

  const cipher = createCipheriv("aes-256-gcm", deriveKey(context), iv).setAAD(
    Buffer.from(context.owner),
  );

  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);

  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64");
}

export function decryptSecret(value: string, context: SecretContext) {
  const bytes = Buffer.from(value, "base64");

  const decipher = createDecipheriv("aes-256-gcm", deriveKey(context), bytes.subarray(0, 12))
    .setAAD(Buffer.from(context.owner))
    .setAuthTag(bytes.subarray(12, 28));

  return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}
