import { db } from "../../database";
import { GradeChangeEventHandler } from "./events/grade-change-event";

export async function startNotifier() {
  const gradeChangeEventHandler = new GradeChangeEventHandler(db.messageStream);

  await Promise.all([gradeChangeEventHandler.runJob()]);
}
