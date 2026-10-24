import { expect, test } from "vite-plus/test";
import { decryptSecret, encryptSecret } from "./crypto";

const context = { key: "test-key", purpose: "my-du-credentials", owner: "1" };

test("encrypts secrets and binds decryption to the key, purpose, and owner", () => {
  const encrypted = encryptSecret("private-token", context);

  expect(encrypted).not.toContain("private-token");
  expect(decryptSecret(encrypted, context)).toBe("private-token");
  expect(() => decryptSecret(encrypted, { ...context, owner: "2" })).toThrow();
  expect(() => decryptSecret(encrypted, { ...context, purpose: "other" })).toThrow();
  expect(() => decryptSecret(encrypted, { ...context, key: "other-key" })).toThrow();
});
