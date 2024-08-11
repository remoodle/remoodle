import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../../../database";
import { config } from "../../../config";

import { RMC } from "../../../library/rmc-sdk";

import { hashPassword, verifyPassword } from "../../../utils/crypto";
import { issueTokens } from "../../../utils/jwt";

import { authMiddleware } from "../middleware/auth";

const api = new Hono<{
  Variables: {
    userId: string;
    moodleId: string;
    host: string;
  };
}>();

api.post("/auth/register", async (ctx) => {
  const { email, telegramId, password, moodleToken } = await ctx.req.json();

  if (!(moodleToken && (email || telegramId))) {
    throw new HTTPException(500, { message: "Missing required parameters" });
  }

  let ghost;
  try {
    ghost = await db.user.create({
      email,
      telegramId,
      ...(password && { password: hashPassword(password) }),
      moodleId: null,
    });
  } catch (error: any) {
    throw new HTTPException(500, {
      message: `Failed to save user in the database ${error}`,
    });
  }

  let student;
  try {
    const rmc = new RMC(config.core.url, moodleToken);

    const [data, error] = await rmc.createUser({
      token: moodleToken,
    });

    if (error) {
      throw error;
    }

    student = data;
  } catch (error: any) {
    try {
      await db.user.deleteOne({ _id: ghost._id });
    } catch (e: any) {
      throw new HTTPException(500, {
        message: e.message,
      });
    }

    throw new HTTPException(500, {
      message: error.message,
    });
  }

  const user = await db.user.findOneAndUpdate(
    { _id: ghost._id },
    { $set: { name: student.name, moodleId: student.moodle_id } },
    { upsert: true, new: true },
  );

  if (!user) {
    throw new HTTPException(500, {
      message: "Failed to update user in the database",
    });
  }

  const { accessToken, refreshToken } = issueTokens(user._id, user.moodleId);

  user.password = "***";

  return ctx.json({
    user,
    accessToken,
    refreshToken,
  });
});

api.post("/auth/login", async (ctx) => {
  const { email, password } = await ctx.req.json();

  if (!email || !password) {
    throw new HTTPException(400, {
      message: "Please provide an email and password",
    });
  }

  const user = await db.user.findOne({ email });
  if (!user) {
    throw new HTTPException(401, {
      message: "No user found with this email",
    });
  }

  if (!verifyPassword(password, user.password)) {
    throw new HTTPException(401, {
      message: "Invalid credentials",
    });
  }

  try {
    const { accessToken, refreshToken } = issueTokens(
      user._id.toString(),
      user.moodleId,
    );

    user.password = "***";

    return ctx.json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
});

api.get("/health", async (ctx) => {
  const rmc = new RMC(config.core.url);

  const [data, error] = await rmc.health();

  if (error) {
    throw error;
  }

  return ctx.json(data);
});

// api.get("/health", proxyRequest(API_METHODS.HEALTH));

api.use("*", authMiddleware());

// api.get("/v1/course/*", proxyRequest(API_METHODS.V1_COURSE));
// api.get(
//   "/v1/user/courses/overall",
//   proxyRequest(API_METHODS.V1_USER_COURSES_OVERALL),
// );
// api.get("/v1/user/deadlines", proxyRequest(API_METHODS.V1_USER_DEADLINES));
// api.get("/v1/user/course/*", proxyRequest(API_METHODS.V1_USER_COURSE));

api.delete("/goodbye", async (ctx) => {
  const userId = ctx.get("userId");

  const user = await db.user.findOne({ _id: userId });

  if (!user) {
    throw new HTTPException(400, {
      message: "User not found",
    });
  }

  const rmc = new RMC(config.core.url, {
    secret: config.core.secret,
    moodleId: user.moodleId,
  });

  const [_, error] = await rmc.deleteUser();

  if (error) {
    throw error;
  }

  try {
    await db.user.deleteOne({ _id: userId });
  } catch (error) {
    throw new HTTPException(500, {
      message: `Failed to delete user from the database ${error}`,
    });
  }

  return ctx.text("OK", 200);
});

export default api;
