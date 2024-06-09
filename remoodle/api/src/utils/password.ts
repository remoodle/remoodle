import bcrypt from "bcrypt";

export const verifyPassword = async (
  enteredPassword: string,
  userPassword: string,
) => {
  return await bcrypt.compare(enteredPassword, userPassword);
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 4);
};
