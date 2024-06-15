import type { MessageStream } from "../../database/redis/models/MessageStream";
import { GradeChangeEventHandler } from "./events/grade-change-event";

export class TaskManager {
  private handlers: any[];
  private messageStream: MessageStream;

  constructor(messageStream: MessageStream) {
    this.messageStream = messageStream;
    this.handlers = [];
  }

  registerHandler(handlerClass: any) {
    const handler = new handlerClass(this.messageStream);
    this.handlers.push(handler);
  }

  async runAll() {
    const handlerPromises = this.handlers.map((handler) => handler.runJob());
    await Promise.all(handlerPromises);
  }
}

export async function startNotifier(messageStream: MessageStream) {
  const taskManager = new TaskManager(messageStream);

  taskManager.registerHandler(GradeChangeEventHandler);

  await taskManager.runAll();
}
