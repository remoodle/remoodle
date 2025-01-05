import { Worker, FlowProducer } from "bullmq";
import type { WorkerOptions } from "bullmq";
import type { MoodleCourseClassification } from "@remoodle/types";
import { getValues, objectEntries, partition } from "@remoodle/utils";
import { mSecOneDay } from "../../config/constants";
import { db } from "../../library/db";
import { getDeadlines } from "../../core/wrapper";
import { logger } from "../../library/logger";
import type {
  GradeChangeDiff,
  GradeChangeEvent,
} from "../../core/events/grades";
import { formatCourseDiffs } from "../../core/events/grades";
import { syncEvents, syncCourses, syncCourseGrades } from "../../core/sync";
import {
  type DeadlineReminderEvent,
  formatDeadlineReminders,
  trackDeadlineReminders,
} from "../../core/events/deadlines";
import { sendTelegramMessage } from "./notifier";
import { queues, QueueName, Task } from "./queues";

const defaultWorkerOptions: WorkerOptions = {
  connection: db.redisConnection,
  removeOnComplete: { age: mSecOneDay },
  removeOnFail: { age: mSecOneDay * 7 },
};

const flowProducer = new FlowProducer({
  connection: db.redisConnection,
});

const withUsers = async (
  cb: (data: { userId: string }[]) => Promise<void>,
  options: Record<string, any> = {},
) => {
  const users = await db.user
    .find({
      moodleId: { $exists: true },
      ...options,
    })
    .lean();

  await cb(
    users.map((user) => ({
      userId: user._id,
    })),
  );
};

const withUsersCourses = async (
  classification: MoodleCourseClassification | undefined,
  cb: (
    groups: [
      string,
      (
        | {
            userId: string;
            courseId: number;
            courseName: string;
          }[]
        | undefined
      ),
    ][],
  ) => Promise<void>,
) => {
  const users = await db.user
    .find({
      moodleId: { $exists: true },
    })
    .lean();

  const courses = await db.course
    .find({
      userId: { $in: users.map((user) => user._id) },
      deleted: false,
      ...(classification && { classification }),
    })
    .lean();

  const data = courses.map((course) => ({
    userId: course.userId,
    courseId: course.data.id,
    courseName: course.data.fullname,
  }));

  await cb(objectEntries(partition(data, ({ userId }) => userId)));
};

const eventsWorker = new Worker(
  QueueName.EVENTS,
  async (job) => {
    if (job.name === Task.SCHEDULE_EVENTS) {
      await withUsers(async (data) => {
        queues.eventsQueue.addBulk(
          data.map((payload) => ({
            name: Task.UPDATE_EVENTS,
            data: { userId: payload.userId },
            opts: {
              deduplication: {
                id: payload.userId,
              },
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 1000,
              },
            },
          })),
        );
      });
    }

    if (job.name === Task.UPDATE_EVENTS) {
      const { userId } = job.data;

      await syncEvents(userId);
    }
  },
  { ...defaultWorkerOptions, concurrency: 10 },
);

const coursesWorker = new Worker(
  QueueName.COURSES,
  async (job) => {
    if (job.name === Task.SCHEDULE_COURSES) {
      await withUsers(async (data) => {
        queues.coursesQueue.addBulk(
          data.map((payload) => ({
            name: Task.UPDATE_COURSES,
            data: { userId: payload.userId },
            opts: {
              deduplication: {
                id: payload.userId,
              },
              attempts: 2,
              backoff: {
                type: "exponential",
                delay: 1000,
              },
            },
          })),
        );
      });
    }

    if (job.name === Task.UPDATE_COURSES) {
      const { userId } = job.data;

      await syncCourses(userId);
    }
  },
  { ...defaultWorkerOptions, concurrency: 10 },
);

const gradesWorker = new Worker(
  QueueName.GRADES,
  async (job) => {
    if (job.name === Task.SCHEDULE_GRADES) {
      await withUsersCourses("inprogress", async (data) => {
        data.map(async ([userId, courses]) => {
          if (!courses) {
            return;
          }

          const courseIds = courses.map((course) => course.courseId);

          const data = {
            userId,
            courseIds,
          };

          await flowProducer.add({
            name: Task.COMBINE_GRADES,
            queueName: QueueName.GRADES,
            data,
            children: (courses ?? []).map((course) => {
              const data = {
                userId,
                courseId: course.courseId,
                courseName: course.courseName,
                trackDiff: true,
              };

              return {
                name: Task.UPDATE_GRADES,
                data,
                queueName: QueueName.GRADES_CHILDREN,
                opts: {
                  attempts: 4,
                  backoff: {
                    type: "exponential",
                    delay: 2000,
                  },
                  deduplication: {
                    id: `${userId}::${course.courseId}`,
                  },
                  removeDependencyOnFailure: true,
                },
              };
            }),
            opts: {
              deduplication: {
                id: `${userId}::${courseIds.join("-")}`,
              },
            },
          });
        });
      });
    }

    if (job.name === Task.COMBINE_GRADES) {
      const { userId, courseIds } = job.data;

      const childrenValues = await job.getChildrenValues<
        GradeChangeDiff | undefined
      >();

      const gradeChangeEvent: GradeChangeEvent = {
        userId,
        payload: getValues(childrenValues)
          .filter(Boolean)
          .filter((course) => !!course?.changes.length)
          .map((value) => value) as GradeChangeDiff[],
      };

      if (gradeChangeEvent.payload.length) {
        await queues.telegramQueue.add(QueueName.TELEGRAM, {
          userId,
          message: formatCourseDiffs(gradeChangeEvent.payload),
        });
      }
    }
  },
  { ...defaultWorkerOptions, concurrency: 600 },
);

const gradesChildrenWorker = new Worker(
  QueueName.GRADES_CHILDREN,
  async (job) => {
    if (job.name === Task.UPDATE_GRADES) {
      const { userId, courseId, courseName, trackDiff } = job.data;

      return await syncCourseGrades(userId, courseId, courseName, trackDiff);
    }
  },
  { ...defaultWorkerOptions, concurrency: 300 },
);

const remindersWorker = new Worker(
  QueueName.REMINDERS,
  async (job) => {
    if (job.name === Task.SCHEDULE_REMINDERS) {
      await withUsers(
        async (data) => {
          queues.remindersQueue.addBulk(
            data.map((payload) => ({
              name: Task.CHECK_REMINDERS,
              data: { userId: payload.userId },
              opts: {
                deduplication: {
                  id: payload.userId,
                },
              },
            })),
          );
        },
        {
          telegramId: { $exists: true },
          "notificationSettings.telegram.deadlineReminders": true,
        },
      );
    }

    if (job.name === Task.CHECK_REMINDERS) {
      const { userId } = job.data;

      const user = await db.user.findOne({
        _id: userId,
        "notificationSettings.telegram.deadlineReminders": true,
      });

      if (!user) {
        throw new Error("User not found");
      }

      const customThresholds = user.notificationSettings.deadlineThresholds;

      const deadlines = await getDeadlines(userId);

      const courseReminders = trackDeadlineReminders(
        deadlines,
        customThresholds,
      );

      const reminders = courseReminders.flatMap(
        (reminder) => reminder.deadlines,
      );

      if (!reminders.length) {
        return;
      }

      for (const reminder of reminders) {
        const deadline = deadlines.find(
          (deadline) => deadline.id === reminder[0],
        );

        if (!deadline) {
          continue;
        }

        deadline.reminders[reminder[4]] = true;

        await db.event.findOneAndUpdate(
          { userId, "data.id": deadline.id },
          {
            $set: {
              reminders: deadline.reminders,
            },
          },
          { upsert: true },
        );
      }

      const deadlineReminderEvent: DeadlineReminderEvent = {
        userId,
        payload: courseReminders,
      };

      if (deadlineReminderEvent.payload.length) {
        await queues.telegramQueue.add(QueueName.TELEGRAM, {
          userId,
          message: formatDeadlineReminders(deadlineReminderEvent.payload),
        });
      }
    }
  },
  { ...defaultWorkerOptions, concurrency: 25 },
);

const telegramWorker = new Worker(
  QueueName.TELEGRAM,
  async (job) => {
    const { userId, message } = job.data;

    const user = await db.user.findOne({ _id: userId });

    if (!user) {
      throw new Error(`user ${user} not found `);
    }

    if (!user.telegramId || !user.notificationSettings.telegram.gradeUpdates) {
      return job.remove();
    }

    const response = await sendTelegramMessage(user.telegramId, message);

    if (response.ok) {
      logger.grades.info(
        message,
        `Sent notification to ${user.name} (${user.moodleId})`,
      );
    } else {
      logger.grades.error(
        {
          status: response.status,
          statusText: response.statusText,
        },
        `Failed to send notification to ${user.name} (${user.moodleId})`,
      );
    }
  },
  { ...defaultWorkerOptions, concurrency: 5 },
);

export const workers = {
  eventsWorker,
  coursesWorker,
  gradesWorker,
  gradesChildrenWorker,
  remindersWorker,
  telegramWorker,
};

export const workerValues = getValues(workers);

export const closeWorkers = async () => {
  for (const worker of workerValues) {
    await worker.close();
  }
};
