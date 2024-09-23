import { Telegram } from "@remoodle/utils";
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
  tasks: "TasksQueue",
  deadlinesCrawler: "DeadlinesCrawlerQueue",
  deadlinesHandler: "DeadlinesHandlerQueue",
  coursesCrawler: "CoursesCrawlerQueue",
  coursesHandler: "CoursesHandlerQueue",
};
