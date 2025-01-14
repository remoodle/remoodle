import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { FlowProducer } from "bullmq";

import type {
  IUser,
  MoodleAssignment,
  MoodleCourse,
  MoodleEvent,
  MoodleGrade,
} from "@remoodle/types";

import { config, env } from "../../../config";
import { db } from "../../../library/db";
import { deleteUser } from "../../../core/wrapper";
import { QueueName, JobName } from "../../../core/queues";
import { requestAlertWorker } from "../../../library/hc";
import { Moodle } from "../../../library/moodle";
import {
  hashPassword,
  verifyPassword,
  verifyTelegramData,
} from "../helpers/crypto";
import { issueTokens } from "../helpers/jwt";
import { defaultRules, rateLimiter } from "../middleware/ratelimit";
import { authMiddleware } from "../middleware/auth";
import { userGauge } from "../middleware/metrics";

const publicRoutes = new Hono().get("/health", async (ctx) => {
  return ctx.json({ status: "ok" });
});

const authRoutes = new Hono<{
  Variables: {
    telegramId?: number;
  };
}>()
  .use("*", authMiddleware(["Telegram"], false))
  .post(
    "/token",
    rateLimiter({
      ...defaultRules,
      windowMs: 1 * 60 * 60 * 1000, // 1 hour
      limit: 10,
    }),
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

      const telegramId = ctx.get("telegramId");

      const client = new Moodle(moodleToken);

      const [student, error] = await client.call(
        "core_webservice_get_site_info",
      );

      if (error) {
        throw new HTTPException(500, { message: error.message });
      }

      const existingUser = await db.user.findOne({
        moodleId: student.userid,
      });

      if (existingUser && telegramId) {
        await db.user.updateOne(
          { _id: existingUser._id },
          { $set: { telegramId } },
        );

        if (student.userid === existingUser.moodleId) {
          await db.user.updateOne(
            { _id: existingUser._id },
            {
              $set: {
                moodleToken,
                username: student.username,
                name: student.fullname,
                health: 7,
              },
            },
          );
        }
      }

      if (!existingUser) {
        try {
          const newUser = (await db.user.create({
            name: student.fullname,
            username: student.username,
            handle: handle,
            moodleId: student.userid,
            moodleToken,
            ...(telegramId && { telegramId }),
            ...(password && { password: hashPassword(password) }),
          })) as IUser;

          const { _id: userId } = newUser;

          try {
            const flowProducer = new FlowProducer({
              connection: db.redisConnection,
            });

            await flowProducer.add({
              name: JobName.UPDATE_GRADES,
              queueName: QueueName.GRADES_FLOW,
              data: { userId, trackDiff: false },
              opts: {
                priority: 1,
              },
              children: [
                {
                  name: JobName.UPDATE_COURSES,
                  queueName: QueueName.COURSES,
                  data: { userId },
                  opts: {
                    priority: 1,
                  },
                },
                {
                  name: JobName.UPDATE_EVENTS,
                  queueName: QueueName.EVENTS,
                  data: { userId },
                  opts: {
                    priority: 1,
                  },
                },
              ],
            });
          } catch (error: any) {
            await deleteUser(userId);
            throw new HTTPException(500, {
              message: "Failed to sync data: " + error.message,
            });
          }

          userGauge.inc();

          await requestAlertWorker((client) =>
            client.new.$post({
              json: {
                topic: env.isProduction ? "users2" : "dev",
                message: `New ${telegramId ? "Telegram" : "Regular"} user \n<b>${student.fullname}</b> \n<b>${student.username}</b>`,
              },
            }),
          );
        } catch (error: any) {
          throw new HTTPException(500, {
            message: "Failed to create user" + error,
          });
        }
      }

      const user: IUser | null = await db.user.findOne({
        moodleId: student.userid,
      });

      if (!user) {
        throw new HTTPException(404, {
          message: "User not found",
        });
      }

      try {
        const { accessToken, refreshToken } = issueTokens(
          user._id,
          user.moodleId,
        );

        // TODO: Sanitize this properly
        user.password = "***";
        user.moodleToken = "***";

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
    "/login",
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
        user.moodleToken = "***";

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
      user.moodleToken = "***";

      return ctx.json({
        user,
        accessToken,
        refreshToken,
      });
    },
  );

const userRoutes = new Hono<{
  Variables: {
    userId: string;
    telegramId: number;
  };
}>()
  .use("*", authMiddleware())
  .use("*", rateLimiter(defaultRules))
  .get(
    "/deadlines",
    zValidator(
      "query",
      z.object({
        courseId: z.string().optional(),
        daysLimit: z.string().optional(),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");

      const { courseId, daysLimit } = ctx.req.valid("query");

      const events = await db.event
        .find({
          userId,
          ...(courseId && { "course.id": courseId }),
          "data.timestart": {
            $gt: Date.now() / 1000,
            ...(daysLimit && {
              $lte: Date.now() / 1000 + parseInt(daysLimit) * 24 * 60 * 60,
            }),
          },
        })
        .lean();

      if (!events.length) {
        const user = await db.user.findById(userId);

        if (!user) {
          throw new HTTPException(404, {
            message: "User not found",
          });
        }

        const client = new Moodle(user.moodleToken);

        const [response, error] = await client.call(
          "core_calendar_get_action_events_by_timesort",
          {
            timesortfrom: Math.floor(Date.now() / 1000 / 86400) * 86400,
            ...(daysLimit && {
              timesortto: parseInt(daysLimit) * 86400,
            }),
          },
        );

        if (error) {
          throw new HTTPException(500, { message: error.message });
        }

        return ctx.json(response.events as MoodleEvent[]);
      }

      return ctx.json(events.map((event) => event.data));
    },
  )
  .get(
    "/courses",
    zValidator(
      "query",
      z.object({
        status: Moodle.zCourseType.optional(),
      }),
    ),
    async (ctx) => {
      const { status } = ctx.req.valid("query");

      const userId = ctx.get("userId");

      const courses = await db.course.find({
        userId,
        deleted: false,
        ...(status && { classification: status }),
      });

      if (!courses.length) {
        const user = await db.user.findById(userId);

        if (!user) {
          throw new HTTPException(404, {
            message: "User not found",
          });
        }

        const client = new Moodle(user.moodleToken);

        const [response, error] = await client.call(
          "core_course_get_enrolled_courses_by_timeline_classification",
          { classification: status ?? null },
        );

        if (error) {
          throw new HTTPException(500, { message: error.message });
        }

        return ctx.json(response.courses as MoodleCourse[]);
      }

      return ctx.json(courses.map((course) => course.data));
    },
  )
  .get(
    "/courses/overall",
    zValidator(
      "query",
      z.object({
        status: Moodle.zCourseType.optional(),
      }),
    ),
    async (ctx) => {
      const { status } = ctx.req.valid("query");

      const userId = ctx.get("userId");

      // TODO: MOVE TO WRAPPER
      const courses = await db.course.find({
        userId,
        deleted: false,
        ...(status && { classification: status }),
      });

      const grades = await db.grade.find({
        userId,
        courseId: { $in: courses.map((course) => course.data.id) },
      });

      return ctx.json(
        courses.map((course) => ({
          ...course.data,
          grades: grades
            .filter((grade) => grade.courseId === course.data.id)
            .map((grade) => grade.data),
        })),
      );
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

      const userId = ctx.get("userId");

      const course = await db.course.findOne({
        userId,
        "data.id": parseInt(courseId),
      });

      if (!course) {
        throw new HTTPException(404, {
          message: "Course not found",
        });
      }

      if (content === "1") {
        const user = await db.user.findById(userId);

        if (!user) {
          throw new HTTPException(404, {
            message: "User not found",
          });
        }

        const client = new Moodle(user.moodleToken);
        const [data, error] = await client.call("core_course_get_contents", {
          courseid: parseInt(courseId),
        });

        if (error) {
          throw error;
        }

        return ctx.json({
          ...course.data,
          content: data,
        });
      }

      return ctx.json({
        ...course.data,
      });
    },
  )
  .get("/course/:courseId/assignments", async (ctx) => {
    const courseId = ctx.req.param("courseId");

    const userId = ctx.get("userId");

    const user = await db.user.findById(userId);

    if (!user) {
      throw new HTTPException(404, {
        message: "User not found",
      });
    }

    const client = new Moodle(user.moodleToken);

    const [response, error] = await client.call("mod_assign_get_assignments", {
      courseids: [parseInt(courseId)],
      capabilities: ["mod/assign:submit"],
    });

    if (error) {
      throw new HTTPException(500, { message: error.message });
    }

    return ctx.json(
      response.courses
        .map((course) => course.assignments)
        .flatMap((a) => a) as MoodleAssignment[],
    );
  })
  .get("/course/:courseId/grades", async (ctx) => {
    const courseId = ctx.req.param("courseId");

    const userId = ctx.get("userId");

    const grades = await db.grade.find({
      userId,
      courseId: parseInt(courseId),
    });

    if (!grades.length) {
      const user = await db.user.findById(userId);

      if (!user) {
        throw new HTTPException(404, {
          message: "User not found",
        });
      }

      const client = new Moodle(user.moodleToken);

      const [response, error] = await client.call(
        "gradereport_user_get_grade_items",
        {
          userid: user.moodleId,
          courseid: parseInt(courseId),
        },
      );

      if (error) {
        throw new HTTPException(500, { message: error.message });
      }

      return ctx.json(response.usergrades[0].gradeitems as MoodleGrade[]);
    }

    return ctx.json(grades.map((grade) => grade.data));
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
          }

          if (telegramDeadlineReminders !== undefined) {
            notificationFields[
              "notificationSettings.telegram.deadlineReminders"
            ] = telegramDeadlineReminders;
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

    try {
      await deleteUser(userId);
    } catch (error) {
      throw new HTTPException(500, {
        message: `Failed to delete user from the database ${error}`,
      });
    }

    userGauge.dec();

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
  .route("/auth", authRoutes)
  .route("/", userRoutes);
