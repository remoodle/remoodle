import { Queue } from "bullmq";
import { getValues } from "@remoodle/utils";
import { db } from "../library/db";

export enum JobName {
  SCHEDULE_COURSES = "courses::schedule-sync",
  UPDATE_COURSES = "courses::update",

  SCHEDULE_EVENTS = "events::schedule-sync",
  UPDATE_EVENTS = "events::update",

  SCHEDULE_GRADES = "grades::schedule-sync",
  UPDATE_GRADES = "grades::update-user",
  UPDATE_COURSE_GRADES = "grades::update-by-course",
  COMBINE_GRADES = "grades::combine-diffs",

  CHECK_REMINDERS = "reminders::check",

  SEND_TELEGRAM_MESSAGE = "telegram::send-message",
  SEND_WEBOOK_EVENT = "webhook::send-event",
}

export enum QueueName {
  EVENTS_SYNC = "events sync",
  EVENTS = "events update",

  COURSES_SYNC = "courses sync",
  COURSES = "courses update",

  GRADES_SYNC = "grades sync",
  GRADES_FLOW = "grades flow",
  GRADES_FLOW_COMBINE = "grades combine",
  GRADES_FLOW_UPDATE = "grades update",

  REMINDERS = "reminders check",

  TELEGRAM = "telegram",
  WEBHOOK = "webhook",
}

export const queueNames = getValues(QueueName);

export const queues: Record<QueueName, Queue> = queueNames.reduce(
  (acc, name) => {
    acc[name] = new Queue(name, {
      connection: db.redisConnection,
    });
    return acc;
  },
  {} as Record<QueueName, Queue>,
);

export const queueValues = getValues(queues);

export const obliterateQueues = async () => {
  for (const queue of queueValues) {
    await queue.obliterate({ force: true });
  }
};

export const closeQueues = async () => {
  for (const queue of queueValues) {
    await queue.close();
  }
};
