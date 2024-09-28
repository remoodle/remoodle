import { pbkdf2Sync, randomBytes, createHmac, createHash } from "node:crypto";

import { config } from "../../../config";

export const hashPassword = (password: string) => {
  const salt = randomBytes(config.pbkdf2.keySize);

  const digest = pbkdf2Sync(
    password,
    salt,
    config.pbkdf2.iterations,
    config.pbkdf2.keySize,
    config.pbkdf2.digestAlg,
  );
  const parts = [
    config.pbkdf2.digestAlg,
    salt.toString("hex"),
    digest.toString("hex"),
    config.pbkdf2.iterations,
  ];

  return parts.join(config.pbkdf2.delimiter);
};

export const verifyPassword = (
  enteredPassword: string,
  userPassword: string,
) => {
  const [digestAlg, salt, digest, iterations] = userPassword.split(
    config.pbkdf2.delimiter,
  );

  return (
    digest ===
    pbkdf2Sync(
      enteredPassword,
      Buffer.from(salt, "hex"),
      Number.parseInt(iterations, 10),
      digest.length / 2,
      digestAlg,
    ).toString("hex")
  );
};

export const verifyTelegramData = (
  telegramData: Record<string, string | number>,
  botToken = config.telegram.token,
): boolean => {
  const { hash } = telegramData;

  const dataCheckString = Object.keys(telegramData)
    .filter((key) => key !== "hash")
    .sort()
    .map((key) => `${key}=${telegramData[key]}`)
    .join("\n");

  const secretKey = createHash("sha256").update(botToken).digest();
  const hmac = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash;
};
