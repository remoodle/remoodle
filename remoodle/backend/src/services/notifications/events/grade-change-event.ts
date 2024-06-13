import type { RedisMessage } from "../../../types";
import { notifyAtTelegram } from "../handlers/telegram";

export async function handleGradeChange(messageData: RedisMessage) {
  const userID = parseInt(messageData.user_id);
  const newGrade = messageData.new_grade;
  const messageText = `Hello, your new grade is: ${newGrade}`;

  const response = await notifyAtTelegram(userID, messageText);
}
