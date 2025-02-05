import { FlowProducer } from "bullmq";
import type { FlowChildJob, FlowJob, Job } from "bullmq";
import { Telegram, getValues, partition } from "@remoodle/utils";
import { config } from "../../config";
import { db } from "../../library/db";
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

      const bulk = await queues[QueueName.EVENTS].addBulk(jobs);

      return bulk.length;
    },
  },
  [JobName.UPDATE_EVENTS]: {
    queueName: QueueName.EVENTS,
    run: async (job) => {
      const { userId } = job.data;

      logger.cluster.info(`Updating events for ${userId}`);

      await syncEvents(userId);

      logger.cluster.info(`Scheduling reminders for ${userId}`);

      const reminderJob = await queues[QueueName.REMINDERS].add(
        QueueName.REMINDERS,
        { userId },
      );

      return reminderJob;
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

      const bulk = await queues[QueueName.COURSES].addBulk(jobs);

      return bulk.length;
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
    run: async (job) => {
      const users = await getUsers();

      const { classification = "inprogress", trackDiff = true } = job.data;

      logger.cluster.info(
        `Updating ${classification} grades for ${users.length} users, trackDiff: ${trackDiff}`,
      );

      const courses = await db.course
        .find({
          deleted: false,
          notingroup: { $ne: true },
          ...(classification && { classification }),
        })
        .lean();

      const grouppedCourses = partition(courses, (course) => course.userId);

      const flow = new FlowProducer({
        connection: db.redisConnection,
      });

      const flows: FlowJob[] = Object.entries(grouppedCourses)
        .map(([userId, courses]) => {
          if (!courses) {
            return;
          }

          const courseIds = courses.map((course) => course.data.id);

          const children: FlowChildJob[] = courses.map((course) => {
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
                ignoreDependencyOnFailure: true,
              },
            };
          });

          return {
            name: JobName.COMBINE_GRADES,
            queueName: QueueName.GRADES_FLOW_COMBINE,
            data: {
              userId,
              trackDiff,
            },
            children,
            opts: {
              deduplication: {
                id: `${userId}::${courseIds.join("-")}`,
              },
            },
          };
        })
        .filter(Boolean);

      const trees = await flow.addBulk(flows);

      return trees.length;
    },
  },
  [JobName.UPDATE_GRADES]: {
    queueName: QueueName.GRADES_FLOW,
    run: async (job) => {
      const { userId, classification, trackDiff } = job.data;

      const { lifo } = job.opts;

      logger.cluster.info(`Updating grades for ${userId}`);

      const courses = await db.course
        .find({
          userId,
          deleted: false,
          notingroup: { $ne: true },
          ...(classification && { classification }),
        })
        .lean();

      if (!courses.length) {
        return;
      }

      const courseIds = courses.map((course) => course.data.id);

      const flow = new FlowProducer({
        connection: db.redisConnection,
      });

      const children: FlowChildJob[] = courses.map((course) => {
        const data = {
          userId,
          courseId: course.data.id,
          courseName: course.data.fullname,
          trackDiff,
        };

        return {
          name: JobName.UPDATE_COURSE_GRADES,
          queueName: QueueName.GRADES_FLOW_UPDATE,
          data,
          opts: {
            lifo,
            attempts: 4,
            backoff: {
              type: "exponential",
              delay: 2000,
            },
            deduplication: {
              id: `${userId}::${course.data.id}`,
            },
            ignoreDependencyOnFailure: true,
          },
        };
      });

      const tree = await flow.add({
        name: JobName.COMBINE_GRADES,
        queueName: QueueName.GRADES_FLOW_COMBINE,
        data: {
          userId,
          courseIds,
        },
        children,
        opts: {
          lifo,
          deduplication: {
            id: `${userId}::${courseIds.join("-")}`,
          },
        },
      });

      return tree.children?.length;
    },
  },
  [JobName.UPDATE_COURSE_GRADES]: {
    queueName: QueueName.GRADES_FLOW_UPDATE,
    run: async (job) => {
      const { userId, courseId, courseName, trackDiff } = job.data;

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

      const user = await db.user.findOne({ _id: userId });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      if (!user.notificationSettings.telegram.gradeUpdates) {
        return "gradeUpdates not enabled";
      }

      const message = formatCourseDiffs(gradeChangeEvent.payload);

      await queues[QueueName.TELEGRAM].add(
        QueueName.TELEGRAM,
        {
          userId,
          message,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          deduplication: {
            id: `${userId}::${message}`,
          },
        },
      );

      return gradeChangeEvent.payload;
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

      const rawEvents = await db.event.find({ userId });

      const events = rawEvents.sort(
        (a, b) => a.data.timestart - b.data.timestart,
      );

      if (!events.length) {
        return "no events";
      }

      const deadlineReminderDiffs = trackDeadlineReminders(
        events,
        user.notificationSettings.deadlineThresholds,
      );

      if (!deadlineReminderDiffs.length) {
        return "no deadline reminders";
      }

      const reminders = deadlineReminderDiffs.flatMap(
        (reminder) => reminder.deadlines,
      );

      for (const [id, name, date, remaining, threshold] of reminders) {
        const event = events.find(({ data }) => data.id === id);

        if (!event) {
          continue;
        }

        const updatedReminders = { ...(event.reminders || {}) };

        updatedReminders[threshold] = true;

        await db.event.findOneAndUpdate(
          { userId, "data.id": event.data.id },
          {
            $set: {
              reminders: updatedReminders,
            },
          },
          { upsert: true },
        );
      }

      const deadlineReminderEvent: DeadlineReminderEvent = {
        userId,
        payload: deadlineReminderDiffs,
      };

      if (!deadlineReminderEvent.payload.length) {
        return "no deadline reminders";
      }

      const message = formatDeadlineReminders(deadlineReminderEvent.payload);

      await queues[QueueName.TELEGRAM].add(
        QueueName.TELEGRAM,
        {
          userId,
          message,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          deduplication: {
            id: `${userId}::${message}`,
          },
        },
      );

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
    .find({ moodleId: { $exists: true }, health: { $gt: 0 }, ...options })
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
