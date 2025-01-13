import { FlowProducer } from "bullmq";
import type { Job } from "bullmq";
import type { MoodleCourseClassification } from "@remoodle/types";
import { getValues, objectEntries, partition } from "@remoodle/utils";
import { Telegram } from "@remoodle/utils";
import { config } from "../../config";
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
import { queues, QueueName, JobName } from "../../core/queues";

export type ClusterJob = {
  queueName: QueueName;
  run(job: Job): Promise<any>;
};

export const jobs: Record<JobName, ClusterJob> = {
  [JobName.SCHEDULE_EVENTS]: {
    queueName: QueueName.EVENTS_SYNC,
    run: async () => {
      const users = await getUsers();

      logger.cluster.info(`Updating events for ${users.length} users`);

      const jobs = users.map((payload) => ({
        name: JobName.UPDATE_EVENTS,
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
      }));

      queues[QueueName.EVENTS].addBulk(jobs);

      return users.length;
    },
  },
  [JobName.UPDATE_EVENTS]: {
    queueName: QueueName.EVENTS,
    run: async (job) => {
      const { userId } = job.data;

      logger.cluster.info(`Updating events for ${userId}`);

      await syncEvents(userId);
    },
  },
  [JobName.SCHEDULE_COURSES]: {
    queueName: QueueName.COURSES_SYNC,
    run: async () => {
      const users = await getUsers();

      logger.cluster.info(`Updating courses for ${users.length} users`);

      const jobs = users.map((payload) => ({
        name: JobName.UPDATE_COURSES,
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
      }));

      queues[QueueName.COURSES].addBulk(jobs);

      return users.length;
    },
  },
  [JobName.UPDATE_COURSES]: {
    queueName: QueueName.COURSES,
    run: async (job) => {
      const { userId } = job.data;

      logger.cluster.info(`Updating courses for ${userId}`);

      await syncCourses(userId);
    },
  },
  [JobName.SCHEDULE_GRADES]: {
    queueName: QueueName.GRADES_SYNC,
    run: async () => {
      const users = await getUsers();

      logger.cluster.info(`Updating grades for ${users.length} users`);

      const jobs = users.map((payload) => ({
        name: JobName.UPDATE_GRADES,
        data: {
          userId: payload.userId,
          classification: "inprogress",
          trackDiff: true,
        },
        opts: {
          deduplication: {
            id: payload.userId,
          },
        },
      }));

      queues[QueueName.GRADES_FLOW].addBulk(jobs);

      return users.length;
    },
  },
  [JobName.UPDATE_GRADES]: {
    queueName: QueueName.GRADES_FLOW,
    run: async (job) => {
      const { userId, classification, trackDiff } = job.data;

      logger.cluster.info(`Updating grades for ${userId}`);

      const courses = await db.course
        .find({
          userId,
          deleted: false,
          ...(classification && { classification }),
        })
        .lean();

      if (!courses.length) {
        return;
      }

      const courseIds = courses.map((course) => course.data.id);

      const data = {
        userId,
        courseIds,
      };

      const flowProducer = new FlowProducer({
        connection: db.redisConnection,
      });

      await flowProducer.add({
        name: JobName.COMBINE_GRADES,
        queueName: QueueName.GRADES_FLOW_COMBINE,
        data,
        children: courses.map((course) => {
          const data = {
            userId,
            courseId: course.data.id,
            courseName: course.data.fullname,
            trackDiff,
          };

          return {
            name: JobName.UPDATE_COURSE_GRADES,
            data,
            queueName: QueueName.GRADES_FLOW_UPDATE,
            opts: {
              attempts: 4,
              backoff: {
                type: "exponential",
                delay: 2000,
              },
              deduplication: {
                id: `${userId}::${course.data.id}`,
              },
              removeDependencyOnFailure: true,
            },
          };
        }),
        // opts: {
        //   deduplication: {
        //     id: `${userId}::${courseIds.join("-")}`,
        //   },
        // },
      });
    },
  },
  [JobName.UPDATE_COURSE_GRADES]: {
    queueName: QueueName.GRADES_FLOW_UPDATE,
    run: async (job) => {
      const { userId, courseId, courseName, trackDiff } = job.data;

      logger.cluster.info(`Updating course ${courseId} grades for ${userId}`);

      return await syncCourseGrades(userId, courseId, courseName, trackDiff);
    },
  },
  [JobName.COMBINE_GRADES]: {
    queueName: QueueName.GRADES_FLOW_COMBINE,
    run: async (job) => {
      const { userId, courseIds } = job.data;

      logger.cluster.info(
        `Combining grades for ${userId}, courses ${courseIds}`,
      );

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

      if (!gradeChangeEvent.payload.length) {
        return "no grade changes";
      }

      const user = await db.user.findOne({ moodleId: userId });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      if (!user.notificationSettings.telegram.gradeUpdates) {
        return "gradeUpdates not enabled";
      }

      await queues[QueueName.TELEGRAM].add(QueueName.TELEGRAM, {
        userId,
        message: formatCourseDiffs(gradeChangeEvent.payload),
      });

      return gradeChangeEvent.payload;
    },
  },
  [JobName.SCHEDULE_REMINDERS]: {
    queueName: QueueName.REMINDERS_SYNC,
    run: async () => {
      const users = await getUsers({
        telegramId: { $exists: true },
        "notificationSettings.telegram.deadlineReminders": true,
      });

      logger.cluster.info(`Updating reminders for ${users.length} users`);

      const jobs = users.map((payload) => ({
        name: JobName.CHECK_REMINDERS,
        data: { userId: payload.userId },
        opts: {
          deduplication: {
            id: payload.userId,
          },
        },
      }));

      queues[QueueName.REMINDERS].addBulk(jobs);
    },
  },
  [JobName.CHECK_REMINDERS]: {
    queueName: QueueName.REMINDERS,
    run: async (job) => {
      const { userId } = job.data;

      logger.cluster.info(`Checking reminders for ${userId}`);

      const user = await db.user.findOne({ _id: userId });

      if (!user) {
        throw new Error(`User ${user} not found `);
      }

      if (!user.notificationSettings.telegram.deadlineReminders) {
        return "deadlineReminders not enabled";
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

      if (!deadlineReminderEvent.payload.length) {
        return "no deadline reminders";
      }

      await queues[QueueName.TELEGRAM].add(QueueName.TELEGRAM, {
        userId,
        message: formatDeadlineReminders(deadlineReminderEvent.payload),
      });

      return deadlineReminderEvent.payload;
    },
  },
  [JobName.SEND_TELEGRAM_MESSAGE]: {
    queueName: QueueName.TELEGRAM,
    run: async (job) => {
      const { userId, message } = job.data;

      logger.cluster.info(`Sending telegram message for ${userId}`);

      const user = await db.user.findOne({ _id: userId });

      if (!user) {
        throw new Error(`User ${user} not found `);
      }

      if (!user.telegramId) {
        return job.remove();
      }

      const response = await sendTelegramMessage(user.telegramId, message);

      if (response.ok) {
        logger.cluster.info(
          message,
          `Sent notification to ${user.name} (${user.moodleId})`,
        );
      } else {
        logger.cluster.error(
          {
            status: response.status,
            statusText: response.statusText,
          },
          `Failed to send notification to ${user.name} (${user.moodleId})`,
        );
      }
    },
  },
};

const getUsers = async (options: Record<string, any> = {}) => {
  const users = await db.user
    .find({ moodleId: { $exists: true }, ...options })
    .lean();

  return users.map((user) => ({ userId: user._id }));
};

async function sendTelegramMessage(chatId: number, message: string) {
  const telegram = new Telegram(config.telegram.token, chatId);

  return await telegram.notify(message, {
    parseMode: "HTML",
    replyMarkup: [
      [
        {
          text: "Clear",
          callback_data: "remove_message",
        },
      ],
    ],
  });
}
