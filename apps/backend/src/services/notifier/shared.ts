import { Telegram } from "@remoodle/utils";
import type { JobsOptions } from "bullmq";
import { config } from "../../config";

export async function sendTelegramMessage(chatId: number, message: string) {
  const telegram = new Telegram(config.telegram.token, chatId);

  return await telegram.notify(message, {
    parseMode: "HTML",
  });
}

export type UserJobData = {
  userId: string;
  userName: string;
  moodleId: number;
};

export const queues = {
  tasks: "SchedulerQueue",
  deadlinesCrawler: "DeadlinesCrawlerQueue",
  deadlinesHandler: "DeadlinesHandlerQueue",
  gradesHandler: "GradesHandlerQueue",
};

export const jobOptions: JobsOptions = {
  removeOnComplete: {
    age: 24 * 3600, // keep up to 24 hours
  },
  removeOnFail: {
    age: 24 * 3600, // keep up to 24 hours
  },
};
