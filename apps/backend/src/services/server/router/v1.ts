import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import type { IUser } from "@remoodle/db";

import { config, env } from "../../../config";
import { db } from "../../../library/db";
import { requestAlertWorker } from "../../../library/hc";
import { RMC } from "../../../library/rmc-sdk";

import {
  hashPassword,
  verifyPassword,
  verifyTelegramData,
} from "../helpers/crypto";
import { issueTokens } from "../helpers/jwt";

import { authMiddleware } from "../middleware/auth";

const publicRoutes = new Hono().get("/health", async (ctx) => {
  const rmc = new RMC();

  const response = await rmc.get_health();

  return ctx.json(response);
});

const authRoutes = new Hono<{
  Variables: {
    telegramId?: number;
  };
}>()
  .use("*", authMiddleware(["Telegram"], false))
  .post(
    "/auth/register",
    zValidator(
      "json",
      z.object({
        moodleToken: z.string(),
        handle: z.string().optional(),
        password: z.string().optional(),
      }),
    ),
    async (ctx) => {
      const { handle, moodleToken, password } = ctx.req.valid("json");

      const rmc = new RMC({ moodleToken });

      const telegramId = ctx.get("telegramId");

      const [student, error] = await rmc.v1_auth_token(moodleToken);

      if (error) {
        throw new HTTPException(500, { message: error.message });
      }

      console.log(student);

      let user: IUser | null = null;

      if (student) {
        user = await db.user.findOne({ moodleId: student.moodle_id });

        if (!user) {
          try {
            user = (await db.user.create({
              name: student.name,
              moodleId: student.moodle_id,
              handle: handle || student.username,
              ...(telegramId && { telegramId }),
              ...(student.email && { email: student.email }),
              ...(password && { password: hashPassword(password) }),
            })) as IUser;

            requestAlertWorker((client) =>
              client.new.$post({
                json: {
                  topic: env.isProduction ? "users2" : "dev",
                  message: `New ${telegramId ? "Telegram" : "Regular"} user \n<b>${student.name}</b> \n<b>${student.moodle_id}</b>`,
                },
              }),
            );
          } catch (error: any) {
            const [_data, _error] = await rmc.v1_delete_user();

            throw new HTTPException(500, {
              message: error.message,
            });
          }
        } else if (!user.telegramId && telegramId) {
          await db.user.updateOne(
            { _id: user._id },
            {
              $set: {
                telegramId,
              },
            },
          );
        }
      }

      if (!user) {
        throw new HTTPException(401, { message: "Invalid token" });
      }

      try {
        const { accessToken, refreshToken } = issueTokens(
          user._id,
          user.moodleId,
        );

        // TODO: Sanitize this properly
        user.password = "***";

        return ctx.json({
          user,
          accessToken,
          refreshToken,
        });
      } catch (error: any) {
        throw new HTTPException(500, {
          message: error.message,
        });
      }
    },
  )
  .post(
    "/auth/login",
    zValidator(
      "json",
      z.object({
        identifier: z.string(),
        password: z.string(),
      }),
    ),
    async (ctx) => {
      const { identifier, password } = ctx.req.valid("json");

      try {
        const user = (await db.user.findOne({
          $or: [{ email: identifier }, { handle: identifier }],
        })) as IUser | null;

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("Cannot login with this email");
        }

        if (!verifyPassword(password, user.password)) {
          throw new Error("Invalid credentials");
        }

        const { accessToken, refreshToken } = issueTokens(
          user._id.toString(),
          user.moodleId,
        );

        // TODO: Sanitize this properly
        user.password = "***";

        return ctx.json({
          user,
          accessToken,
          refreshToken,
        });
      } catch (error: any) {
        throw new HTTPException(500, {
          message: error.message,
        });
      }
    },
  )
  .post(
    "/oauth/telegram/callback",
    zValidator(
      "json",
      z.object({
        id: z.number(),
        first_name: z.string(),
        last_name: z.string().optional(),
        username: z.string().optional(),
        photo_url: z.string().optional(),
        auth_date: z.number(),
        hash: z.string(),
      }),
    ),
    async (ctx) => {
      const telegramData = ctx.req.valid("json");

      if (!verifyTelegramData(telegramData)) {
        throw new HTTPException(400, {
          message: "Invalid Telegram data",
        });
      }

      let user: IUser | null = await db.user.findOne({
        telegramId: telegramData.id,
      });

      if (!user) {
        throw new HTTPException(401, {
          message: "User not found. Please register first.",
        });
      }

      const { accessToken, refreshToken } = issueTokens(
        user._id.toString(),
        user.moodleId,
      );

      // TODO: Sanitize this properly
      user.password = "***";

      return ctx.json({
        user,
        accessToken,
        refreshToken,
      });
    },
  );

const commonProtectedRoutes = new Hono<{
  Variables: {
    userId: string;
    moodleId: number;
    telegramId: number;
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
  .get(
    "/courses",
    zValidator(
      "query",
      z.object({
        status: RMC.zCourseType.optional(),
      }),
    ),
    async (ctx) => {
      const { status } = ctx.req.valid("query");

      const moodleId = ctx.get("moodleId");

      const rmc = new RMC({ moodleId });
      const [data, error] = await rmc.v1_user_courses({ status });

      if (error) {
        throw error;
      }

      return ctx.json(data);
    },
  )
  .get(
    "/courses/overall",
    zValidator(
      "query",
      z.object({
        status: RMC.zCourseType.optional(),
      }),
    ),
    async (ctx) => {
      const { status } = ctx.req.valid("query");

      const moodleId = ctx.get("moodleId");

      const rmc = new RMC({ moodleId });
      const [data, error] = await rmc.v1_user_courses_overall({
        status,
      });

      if (error) {
        throw error;
      }

      return ctx.json(data);
    },
  )
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
  .get("/user/settings", async (ctx) => {
    const userId = ctx.get("userId");

    const user = await db.user.findOne({ _id: userId });

    if (!user) {
      throw new HTTPException(401, {
        message: "User not found",
      });
    }

    return ctx.json({
      moodleId: user.moodleId,
      name: user.name,
      handle: user.handle,
      hasPassword: !!user.password,
      telegramId: user.telegramId,
      notifications: {
        telegram: {
          enabled:
            user.notificationSettings.telegram.deadlineReminders ||
            user.notificationSettings.telegram.gradeUpdates,
          gradeUpdates: user.notificationSettings.telegram.gradeUpdates,
          deadlineReminders:
            user.notificationSettings.telegram.deadlineReminders,
        },
        deadlineThresholds: user.notificationSettings.deadlineThresholds,
      },
    });
  })
  .post(
    "/user/settings",
    zValidator(
      "json",
      z.object({
        handle: z.string().optional(),
        password: z.string().optional(),
        telegramDeadlineReminders: z.boolean().optional(),
        telegramGradeUpdates: z.boolean().optional(),
        deadlineThresholds: z.array(z.string()).optional(),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");

      const {
        handle,
        password,
        telegramDeadlineReminders,
        telegramGradeUpdates,
        deadlineThresholds,
      } = ctx.req.valid("json");

      try {
        const user = await db.user.findOne({ _id: userId });

        if (!user) {
          throw new HTTPException(401, {
            message: "User not found",
          });
        }

        if (handle) {
          await db.user.updateOne(
            { _id: userId },
            {
              $set: {
                handle,
              },
            },
          );
        }

        if (password) {
          await db.user.updateOne(
            { _id: userId },
            {
              $set: {
                password: hashPassword(password),
              },
            },
          );
        }

        if (
          telegramDeadlineReminders !== undefined ||
          telegramGradeUpdates !== undefined
        ) {
          const notificationFields: { [key: string]: any } = {};

          if (telegramGradeUpdates !== undefined) {
            notificationFields["notificationSettings.telegram.gradeUpdates"] =
              telegramGradeUpdates;

            // TODO: Consider removing courses for users with grade updates disabled
            // if (!telegramGradeUpdates) {
            //   await db.course.deleteMany({ userId });
            // }
          }

          if (telegramDeadlineReminders !== undefined) {
            notificationFields[
              "notificationSettings.telegram.deadlineReminders"
            ] = telegramDeadlineReminders;

            // TODO: Consider removing deadlines for users with deadline reminders disabled
            // if (!telegramDeadlineReminders) {
            //   await db.deadline.deleteMany({ userId });
            // }
          }

          if (deadlineThresholds !== undefined) {
            if (
              deadlineThresholds.length >
              config.notifications.maxDeadlineThresholds
            ) {
              throw new HTTPException(400, {
                message: "Too many thresholds",
              });
            }

            notificationFields["notificationSettings.deadlineThresholds"] =
              deadlineThresholds;
          }

          await db.user.updateOne(
            { _id: userId },
            {
              $set: notificationFields,
            },
          );
        }

        return ctx.json({ ok: true });
      } catch (error: any) {
        throw new HTTPException(500, {
          message: error.message,
        });
      }
    },
  )
  .delete("/bye", async (ctx) => {
    const userId = ctx.get("userId");

    const user = await db.user.findOne({ _id: userId });

    if (!user) {
      throw new HTTPException(401, {
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
      await db.deadline.deleteMany({ userId });
    } catch (error) {
      throw new HTTPException(500, {
        message: `Failed to delete user from the database ${error}`,
      });
    }

    return ctx.json({ ok: true });
  })
  .post(
    "/otp/verify",
    zValidator(
      "json",
      z.object({
        otp: z.string(),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");

      const { otp } = ctx.req.valid("json");

      try {
        const telegramId = await db.telegramToken.get(otp);

        if (!telegramId) {
          throw new HTTPException(400, { message: "Invalid or expired token" });
        }

        const user = await db.user.findById(userId);

        if (!user) {
          throw new HTTPException(401, { message: "User not found" });
        }

        user.telegramId = parseInt(telegramId);
        await user.save();

        await db.telegramToken.remove(otp);

        return ctx.json({ telegramId });
      } catch (error: any) {
        throw new HTTPException(500, { message: error.message });
      }
    },
  )
  .get("/user/check", async (ctx) => {
    const userId = ctx.get("userId");

    if (!userId) {
      throw new HTTPException(400, {
        message: "no userId",
      });
    }

    const user: IUser | null = await db.user.findOne({ _id: userId });

    if (!user) {
      throw new HTTPException(401, {
        message: "User not found",
      });
    }

    return ctx.json(user);
  });

export const v1 = new Hono()
  .route("/", publicRoutes)
  .route("/", authRoutes)
  .route("/", commonProtectedRoutes);
