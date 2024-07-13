import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../../../database";
import {
  API_METHOD_AUTH_REGISTER,
  API_METHOD_DELETE_USER,
  getCoreInternalHeaders,
  requestCore,
} from "../../../http/core";
import { issueTokens } from "../../../utils/jwt";
import { authMiddleware } from "../middleware/auth-proxy";
import { proxyRequest } from "../middleware/proxy";

const api = new Hono<{
  Variables: {
    userId: string;
    moodleId: string;
    host: string;
  };
}>();

api.post("/auth/register", async (c) => {
  const { email, telegramId, password, moodleToken } = await c.req.json();

  if (!(moodleToken && (email || telegramId))) {
    return c.json({ message: "Missing required parameters" });
  }

  let ghost;
  try {
    ghost = await db.user.create({
      email,
      telegramId,
      password,
      moodleId: null,
    });
  } catch (error: any) {
    throw new HTTPException(500, {
      message: `Failed to save user in the database ${error}`,
    });
  }

  let student;
  try {
    const [response, error] = await requestCore(API_METHOD_AUTH_REGISTER, {
      headers: {
        "Auth-Token": moodleToken,
      },
      body: JSON.stringify({
        token: moodleToken,
      }),
    });

    if (error) {
      throw error;
    }

    student = response.data;
  } catch (error: any) {
    try {
      await db.user.deleteOne({ _id: ghost._id });
    } catch (rollbackError) {
      console.error("Failed to rollback the user in MongoDB:", rollbackError);
    }

    throw new HTTPException(400, {
      message: error.message,
    });
  }

  const user = await db.user.findOneAndUpdate(
    { _id: ghost._id },
    { $set: { name: student.name, moodleId: student.moodle_id } },
    { upsert: true, new: true },
  );

  if (!user) {
    throw new HTTPException(400, {
      message: "Failed to update user in the database",
    });
  }

  const { accessToken, refreshToken } = issueTokens(user._id, user.moodleId);

  return c.json({
    user,
    accessToken,
    refreshToken,
  });
});

api.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json();

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

  if (!(await user.verifyPassword(password))) {
    throw new HTTPException(401, {
      message: "Invalid credentials",
    });
  }

  const { accessToken, refreshToken } = issueTokens(
    user._id.toString(),
    user.moodleId,
  );

  return c.json({
    user,
    accessToken,
    refreshToken,
  });
});

api.get("/health", proxyRequest());

api.use("*", authMiddleware());

api.get("/v1/user/courses/overall", proxyRequest());
api.get("/v1/user/deadlines", proxyRequest());
api.get("/v1/course/*", proxyRequest());

api.delete("/goodbye", async (c) => {
  const userId = c.get("userId");

  const user = await db.user.findOne({ _id: userId });

  if (!user) {
    throw new HTTPException(400, {
      message: "User not found",
    });
  }

  const [_, error] = await requestCore(API_METHOD_DELETE_USER, {
    headers: getCoreInternalHeaders(user.moodleId),
  });

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

  return c.text("OK", 200);
});

export default api;
