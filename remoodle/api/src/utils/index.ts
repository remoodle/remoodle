import bcrypt from "bcrypt";
import { Jwt } from "hono/utils/jwt";

import { config } from "../config";

export { default as deduceCreditCardType } from "credit-card-type";

const genToken = (id: string) => {
  return Jwt.sign({ id }, config.jwtSecret);
};

const verifyPassword = async (
  enteredPassword: string,
  userPassword: string,
) => {
  return await bcrypt.compare(enteredPassword, userPassword);
};

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 4);
};

export { genToken, verifyPassword, hashPassword };
