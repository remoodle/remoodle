import { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import { User } from "../db";
import { issueTokens } from "../utils/jwt";
import { authMiddleware, proxyMiddleware } from "../middleware/auth-proxy";

const api = new Hono<{
  Variables: {
    userId: string;
    moodleId: string;
    host: string;
  };
}>();

const prepareURL = (host: string, path: string) => {
  const requestURL = new URL(path, host);

  return requestURL;
};

api.use("*", proxyMiddleware());

api.post("/auth/register", async (c) => {
  const { email, telegramId, password, moodleToken } = await c.req.json();

  if (!(moodleToken && (email || telegramId))) {
    return c.json({ message: "Missing required parameters" });
  }

  let ghost;
  try {
    ghost = await User.create({
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
    const response = await fetch(
      prepareURL(c.get("host"), "/v1/auth/register"),
      {
        method: "POST",
        headers: {
          "Auth-Token": moodleToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: moodleToken,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to create user in the critical service");
    }

    student = await response.json();
  } catch (error: any) {
    try {
      await User.deleteOne({ _id: ghost._id });
    } catch (rollbackError) {
      console.error("Failed to rollback the user in MongoDB:", rollbackError);
    }

    throw new HTTPException(400, {
      message: error.message,
    });
  }

  const user = await User.findOneAndUpdate(
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

  const user = await User.findOne({ email });
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
  const requestURL = prepareURL(c.get("host"), path);
  // const requestURL = new URL(requestPath, "https://aitu0.remoodle.api/");

  //   public const INTERNAL_CROSS_TOKEN_HEADER = 'X-Remoodle-Internal-Token';
  //   public const INTERNAL_CROSS_USER_HEADER = 'X-Remoodle-Moodle-Id';

  // console.log(c.get("moodleId"));

  const headers = new Headers({
    "Content-Type": "apilication/json",
    // Authorization: `Bearer ${c.get("userId")}`,
    // "X-Moodle-Id": c.get("moodleId"),
    "X-Remoodle-Internal-Token": "private-token",
    "X-Remoodle-Moodle-Id": c.get("moodleId"),
  });

  const response = await fetch(requestURL, {
    method: c.req.method,
    headers: headers,
    body: c.req.raw.body,
  });

  if (response.status === 101) return response;

  return c.newResponse(response.body, response.status as StatusCode);
});

export default api;
