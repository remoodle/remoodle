import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { db } from "../../../library/db";
import { RMC } from "../../../library/rmc-sdk";

import { hashPassword, verifyPassword } from "../helpers/crypto";
import { issueTokens } from "../helpers/jwt";

import { authMiddleware } from "../middleware/auth";

const publicApi = new Hono()
  .post(
    "/auth/register",
    zValidator(
      "json",
      z.object({
        moodleToken: z.string(),
        email: z.string().optional(),
        telegramId: z.number().optional(),
        password: z.string().optional(),
      }),
    ),
    async (ctx) => {
      const { email, telegramId, moodleToken, password } =
        ctx.req.valid("json");

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
        const rmc = new RMC({ moodleToken });

        const [data, error] = await rmc.v1_auth_register({
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

      const { accessToken, refreshToken } = issueTokens(
        user._id,
        user.moodleId,
      );

      user.password = "***";

      return ctx.json({
        user,
        accessToken,
        refreshToken,
      });
    },
  )
  .post(
    "/auth/login",
    zValidator(
      "json",
      z.object({
        email: z.string(),
        password: z.string(),
      }),
    ),
    async (ctx) => {
      const { email, password } = ctx.req.valid("json");

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
    },
  )
  .get("/health", async (ctx) => {
    const rmc = new RMC();

    const [data, error] = await rmc.get_health();

    if (error) {
      throw error;
    }

    return ctx.json(data);
  });

const privateApi = new Hono<{
  Variables: {
    userId: string;
    moodleId: number;
  };
}>()
  .use("*", authMiddleware())
  .get("/deadlines", async (ctx) => {
    const moodleId = ctx.get("moodleId");

    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_user_deadlines();

    if (error) {
      throw error;
    }

    return ctx.json(data);
  })
  .get("/courses", async (ctx) => {
    const moodleId = ctx.get("moodleId");

    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_user_courses();

    if (error) {
      throw error;
    }

    return ctx.json(data);
  })
  .get("/courses/overall", async (ctx) => {
    const moodleId = ctx.get("moodleId");

    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_user_courses_overall();

    if (error) {
      throw error;
    }

    return ctx.json(data);
  })
  .get(
    "/course/:courseId",
    zValidator(
      "query",
      z.object({
        content: z.string().optional().default("0"),
      }),
    ),
    async (ctx) => {
      const courseId = ctx.req.param("courseId");
      const { content } = ctx.req.valid("query");

      const moodleId = ctx.get("moodleId");

      const rmc = new RMC({ moodleId });
      const [data, error] = await rmc.v1_course_content(courseId, content);

      if (error) {
        throw error;
      }

      return ctx.json(data);
    },
  )
  .get("/course/:courseId/assignments", async (ctx) => {
    const courseId = ctx.req.param("courseId");

    const moodleId = ctx.get("moodleId");

    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_course_assignments(courseId);

    if (error) {
      throw error;
    }

    return ctx.json(data);
  })
  .get("/course/:courseId/grades", async (ctx) => {
    const courseId = ctx.req.param("courseId");

    const moodleId = ctx.get("moodleId");

    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_user_course_grades(courseId);

    if (error) {
      throw error;
    }

    return ctx.json(data);
  })
  .delete("/goodbye", async (ctx) => {
    const userId = ctx.get("userId");

    const user = await db.user.findOne({ _id: userId });

    if (!user) {
      throw new HTTPException(400, {
        message: "User not found",
      });
    }

    const rmc = new RMC({ moodleId: user.moodleId });
    const [_, error] = await rmc.v1_delete_user();

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

export { publicApi, privateApi };
