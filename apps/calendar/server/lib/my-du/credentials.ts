import { decryptSecret, encryptSecret } from "../crypto";
import { credentialsSchema, parseMyDuResponse, type MyDuCredentials } from "./schemas";

export function encryptCredentials(value: MyDuCredentials, secret: string, userId: string) {
  return encryptSecret(JSON.stringify(value), secret, userId);
}

export async function decryptCredentials(value: string, secret: string, userId: string) {
  return parseMyDuResponse(
    credentialsSchema,
    JSON.parse(await decryptSecret(value, secret, userId)),
  );
}
