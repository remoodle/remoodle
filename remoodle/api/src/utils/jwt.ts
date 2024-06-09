import jwt, { type Algorithm } from "jsonwebtoken";
// const util = require('util');
import { promisify } from "node:util";
import { config } from "../config";

const getToken = (payload: object, expiresIn: string) => {
  return jwt.sign(payload, config.jwt.privateKey, {
    algorithm: config.jwt.algorithm as Algorithm,
    expiresIn: expiresIn,
  });
};

export const getAccessToken = (userId: string, moodleId: string) => {
  return getToken({ userId, moodleId }, config.jwt.accessTokenExpiration);
};

export const getRefreshToken = (accessToken: string) => {
  return getToken({ accessToken }, config.jwt.refreshTokenExpiration);
};

export const issueTokens = (userId: string, moodleId: string) => {
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
