import { RateLimitDuration } from "@hatchet-dev/typescript-sdk";
import { createRequestLogger, log } from "evlog";
import { initRemoodleEvlog } from "../library/evlog";
import { hatchet } from "./hatchet-client";
import { calendarFetchUser } from "./workflows/calendar-fetch-user";
import { deadlineCheck } from "./workflows/deadline-check";
import { deadlineCheckUser } from "./workflows/deadline-check-user";
import { deadlineNotifyUser } from "./workflows/deadline-notify-user";
import { digestUser } from "./workflows/digest-user";
import { scheduleReminderCheck } from "./workflows/schedule-reminder-check";
import { scheduleReminderCheckUser } from "./workflows/schedule-reminder-check-user";
import { TELEGRAM_RATE_LIMIT_KEY, telegramSendMessage } from "./workflows/telegram-send-message";

async function main() {
  initRemoodleEvlog("remoodle-worker");

  const requestLog = createRequestLogger({
    method: "BOOT",
    path: "/worker/startup",
  });

  log.info({
    module: "worker",
    operation: "startup",
    message: "Creating Hatchet worker",
  });

  try {
    requestLog.set({
      source: "worker",
      operation: "startup",
      worker: {
        name: "remoodle-worker",
      },
    });

    await hatchet.ratelimits.upsert({
      key: TELEGRAM_RATE_LIMIT_KEY,
      limit: 30,
      duration: RateLimitDuration.SECOND,
    });

    requestLog.set({
      rateLimit: {
        key: TELEGRAM_RATE_LIMIT_KEY,
        limit: 30,
        duration: "second",
      },
    });

    const worker = await hatchet.worker("remoodle-worker", {
      workflows: [
        deadlineCheck,
        calendarFetchUser,
        deadlineCheckUser,
        deadlineNotifyUser,
        scheduleReminderCheck,
        digestUser,
        scheduleReminderCheckUser,
        telegramSendMessage,
      ],
    });

    requestLog.set({
      worker: {
        started: true,
      },
    });
    requestLog.emit({ status: 200 });

    await worker.start();
  } catch (error) {
    requestLog.error(error instanceof Error ? error : new Error(String(error)), {
      step: "startup",
    });
    requestLog.emit({ status: 500 });
    throw error;
  }
}

main().catch((err) => {
  log.error({
    module: "worker",
    operation: "startup",
    error: err instanceof Error ? err : new Error(String(err)),
  });
});
