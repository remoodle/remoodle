import { Hono } from "hono";
import { User } from "../database";
import { genToken } from "../utils";

const api = new Hono();

api.post("/users", async (c) => {
  const { email, telegramId, password } = await c.req.json();

  const userExists = await User.findOne({ $or: [{ email }, { telegramId }] });
  if (userExists) {
    c.status(400);
    return c.json({ message: "User already exists" });
  }

  const user = await User.create({
    // name,
    email,
    telegramId,
    password,
  });

  if (!user) {
    c.status(400);
    return c.json({ message: "Invalid user data" });
  }

  const token = await genToken(user._id.toString());

  return c.json({
    user,
    // success: true,
    // data: {
    //   _id: user._id,
    //   name: user.name,
    //   email: user.email,
    // },
    token,
    // message: "User created successfully",
  });
});

api.post("/users/login", async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    c.status(400);
    return c.json({ message: "Please provide an email and password" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    c.status(401);
    return c.json({ message: "No user found with this email" });
  }

  if (!(await user.verifyPassword(password))) {
    c.status(401);
    throw new Error("Invalid credentials");
  } else {
    const token = await genToken(user._id.toString());

    return c.json({
      user,
      token,
      // success: true,
      // data: {
      //   _id: user._id,
      //   name: user.name,
      //   email: user.email,
      // },
      // token,
      // message: "User logged in successfully",
    });
  }
});

export default api;
