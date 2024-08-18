import { pbkdf2Sync, randomBytes } from "node:crypto";
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

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
