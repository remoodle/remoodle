import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { db } from "../../../library/db";
import type { IUser } from "../../../library/db/mongo/models/User";
import { RMC } from "../../../library/rmc-sdk";

import { generateOTP, hashPassword, verifyPassword } from "../helpers/crypto";
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
        password: z.string().optional(),
      }),
    ),
    async (ctx) => {
      const { email, moodleToken, password } = ctx.req.valid("json");

      const rmc = new RMC({ moodleToken });

      // TODO: Refactor this
      let user: IUser | null = await db.user.findOne({ moodleToken });

      if (!user) {
        try {
          const [data, error] = await rmc.v1_auth_register({
            token: moodleToken,
          });

          if (error) {
            throw error;
          }

          user = (await db.user.create({
            email,
            moodleToken,
            name: data.name,
            moodleId: data.moodle_id,
            handle: data.username,
            ...(data.email && { email: data.email }),
            ...(password && { password: hashPassword(password) }),
          })) as IUser;
        } catch (error: any) {
          const [data, _] = await rmc.v1_delete_user();
          await db.user.deleteOne({ _id: user?._id });

          throw new HTTPException(500, {
            message: error.message,
          });
        }
      }

      const { accessToken, refreshToken } = issueTokens(
        user._id,
        user.moodleId,
      );

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

        // user.password = "***";

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
  .get("/user/settings", async (ctx) => {
    const userId = ctx.get("userId");

    const user = await db.user.findOne({ _id: userId });

    if (!user) {
      throw new HTTPException(400, {
        message: "User not found",
      });
    }

    return ctx.json({
      moodleId: user.moodleId,
      name: user.name,
      handle: user.handle,
      hasPassword: !!user.password,
      telegramId: user.telegramId,
    });
  })
  .post(
    "/user/settings",
    zValidator(
      "json",
      z.object({
        handle: z.string().optional(),
        password: z.string().optional(),
      }),
    ),
    async (ctx) => {
      const userId = ctx.get("userId");

      const { handle, password } = ctx.req.valid("json");

      try {
        const user = await db.user.findOne({ _id: userId });

        if (!user) {
          throw new HTTPException(400, {
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

        return ctx.json({ ok: true });
      } catch (error: any) {
        throw new HTTPException(500, {
          message: error.message,
        });
      }
    },
  )
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

    return ctx.json({ ok: true });
  })
  .post("/telegram/otp/generate", async (ctx) => {
    const userId = ctx.get("userId");

    const user = await db.user.findOne({ _id: userId });

    if (!user) {
      throw new HTTPException(400, {
        message: "User not found",
      });
    }

    if (user.telegramId) {
      throw new HTTPException(400, {
        message: "Telegram ID already connected",
      });
    }

    const otp = generateOTP();

    await db.user.updateOne(
      { _id: userId },
      {
        $set: {
          otp,
          otpExpiry: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes from now
        },
      },
      { upsert: true },
    );

    return ctx.json({ otp });
  })
  // FROM TELEGRAM BOT ONLY WITH ::0
  // TODO: Add auth middleware or move to bot
  .post(
    "/telegram/otp/verify",
    zValidator(
      "json",
      z.object({
        otp: z.string(),
      }),
    ),
    async (ctx) => {
      const { otp } = ctx.req.valid("json");

      const user = await db.user.findOne({ otp });

      const telegramId = ctx.get("telegramId");

      if (!user) {
        throw new HTTPException(400, {
          message: "User not found",
        });
      }

      if (user.otp !== otp) {
        throw new HTTPException(400, {
          message: "Invalid OTP",
        });
      }

      if (user.telegramId && user.telegramId !== telegramId) {
        throw new HTTPException(400, {
          message: "Invalid Telegram ID",
        });
      }

      try {
        await db.user.updateOne(
          {
            _id: user._id,
          },
          {
            $set: {
              otp: null,
              otpExpiry: null,
              telegramId,
            },
          },
        );
      } catch (error: any) {
        throw new HTTPException(500, {
          message: error.message,
        });
      }

      return ctx.json({ ok: true });
    },
  )
  .post(
    "/telegram/register",
    zValidator(
      "json",
      z.object({
        moodleToken: z.string(),
      }),
    ),
    async (ctx) => {
      const { moodleToken } = ctx.req.valid("json");

      const telegramId = ctx.get("telegramId");

      const rmc = new RMC({ moodleToken });

      // TODO: Refactor this
      let user: IUser | null = await db.user.findOne({ moodleToken });

      if (!user) {
        try {
          const [data, error] = await rmc.v1_auth_register({
            token: moodleToken,
          });

          if (error) {
            throw error;
          }

          user = (await db.user.create({
            telegramId,
            moodleToken,
            name: data.name,
            moodleId: data.moodle_id,
            handle: data.username,
            ...(data.email && { email: data.email }),
          })) as IUser;
        } catch (error: any) {
          const [data, _] = await rmc.v1_delete_user();
          await db.user.deleteOne({ _id: user?._id });

          throw new HTTPException(500, {
            message: error.message,
          });
        }
      }

      return ctx.json({
        user,
      });
    },
  );

export const v1 = {
  public: publicApi,
  private: privateApi,
};
