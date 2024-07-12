import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { db } from "../../../database";
import {
  V1_AUTH_REGISTER_URL,
  getCoreInternalHeaders,
  prepareCoreEndpoint,
  requestCore,
} from "../../../http/core";
import { issueTokens } from "../../../utils/jwt";
import { authMiddleware, proxyMiddleware } from "../middleware/auth-proxy";

const api = new Hono<{
  Variables: {
    userId: string;
    moodleId: string;
    host: string;
  };
}>();

api.use("*", proxyMiddleware());

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
    const [data, error] = await requestCore(V1_AUTH_REGISTER_URL, {
      method: "POST",
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

    student = data;
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

const PUBLIC_PATHS = ["/", "/health"];

api.use("*", authMiddleware({ excludePaths: PUBLIC_PATHS }));

api.all("/x/*", async (c) => {
  // remove prefix
  // prefix = /x/*, path = /x/v1/user/courses/overall
  // => suffix_path = /v1/user/courses/overall
  let path = c.req.path;
  path = path.replace(new RegExp(`^${c.req.routePath.replace("*", "")}`), "/");

  if (!path) {
    return c.json({ message: "Forward-To header is required" });
  }

  // eg: 'https://aitu0.remoodle.api/v1/user/courses/overall'
  const [data, error] = await requestCore(prepareCoreEndpoint(path), {
    method: c.req.method,
    headers: getCoreInternalHeaders(c.get("moodleId")),
    body: c.req.raw.body,
  });

  if (error) {
    throw error;
  }

  return c.json(data, 200);
});

export default api;
