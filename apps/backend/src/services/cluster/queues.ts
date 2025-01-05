import { Queue } from "bullmq";
import { getValues } from "@remoodle/utils";
import { db } from "../../library/db";

export enum QueueName {
  EVENTS = "events",
  GRADES = "user grades",
  GRADES_CHILDREN = "grades children",
  COURSES = "courses",
  REMINDERS = "deadline reminders",
  TELEGRAM = "telegram",
}

export enum Task {
  SCHEDULE_GRADES = "sync grades",
  UPDATE_GRADES = "update grades",
  COMBINE_GRADES = "combine grades",

  SCHEDULE_EVENTS = "sync events",
  UPDATE_EVENTS = "update user events",

  SCHEDULE_COURSES = "sync courses",
  UPDATE_COURSES = "update user courses",

  SCHEDULE_REMINDERS = "sync deadline reminders",
  CHECK_REMINDERS = "update user deadline reminders",
}

const eventsQueue = new Queue(QueueName.EVENTS, {
  connection: db.redisConnection,
});

const coursesQueue = new Queue(QueueName.COURSES, {
  connection: db.redisConnection,
});

const gradesQueue = new Queue(QueueName.GRADES, {
  connection: db.redisConnection,
});

const gradesChildrenQueue = new Queue(QueueName.GRADES_CHILDREN, {
  connection: db.redisConnection,
});

const remindersQueue = new Queue(QueueName.REMINDERS, {
  connection: db.redisConnection,
});

const telegramQueue = new Queue(QueueName.TELEGRAM, {
  connection: db.redisConnection,
});

export const queues = {
  eventsQueue,
  coursesQueue,
  gradesQueue,
  gradesChildrenQueue,
  telegramQueue,
  remindersQueue,
};

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
