import jwt, { type Algorithm } from "jsonwebtoken";
import { config } from "../../../config";

const getToken = (payload: object, expiresIn: string) => {
  return jwt.sign(payload, config.jwt.privateKey, {
    algorithm: config.jwt.algorithm as Algorithm,
    expiresIn: expiresIn,
  });
};

export const getAccessToken = (userId: string, moodleId: number) => {
  return getToken({ userId, moodleId }, config.jwt.accessTokenExpiration);
};

export const getRefreshToken = (accessToken: string) => {
  return getToken({ accessToken }, config.jwt.refreshTokenExpiration);
};

export const issueTokens = (userId: string, moodleId: number) => {
  const accessToken = getAccessToken(userId, moodleId);
  const refreshToken = getRefreshToken(accessToken);

  return { accessToken, refreshToken };
};

export const verifyJwtToken = (token: string, toleranceSeconds = null) => {
  return jwt.verify(token, config.jwt.publicKey, {
    clockTolerance:
      toleranceSeconds === null
        ? config.jwt.toleranceSeconds
        : toleranceSeconds,
  });
};

export const decodeJwtToken = (token: string) => {
  return jwt.decode(token);
};
