import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";

import { Queue, Worker } from "bullmq";
import { createDB } from "@remoodle/db";
import { env } from "./config";

import { readDir, inputDir, outputDir } from "./config";

export const db = createDB({
  redisURI: env.REDIS_URI,
});

const BATCH_SIZE = 10;

const registrationQueue = new Queue("user-registration", {
  connection: db.redisConnection,
});

async function registerUser(user: OutputUser): Promise<void> {
  try {
    const response = await fetch(`${env.API_URL}/v1/auth/register`, {
      method: "POST",
      headers: {
        Authorization: `Telegram ${env.API_SECRET}::${user.telegramId}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        moodleToken: user.moodleToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`User ${user.name} registered successfully`);
  } catch (error) {
    console.error(`Failed to register user ${user.name}:`, error);
    throw error;
  }
}

async function processUsers() {
  try {
    const files = await readDir(outputDir);
    console.log(files);

    const file = files[0];

    const data = await readFile(join(outputDir, file), "utf-8");

    const users = JSON.parse(data) as OutputUser[];

    console.log(users.length, "users to process");

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map((user) => registrationQueue.add("register", user))
      );
    }

    console.log("All users queued for registration");
  } catch (error) {
    console.error("Error processing users:", error);
  }
}

const worker = new Worker(
  "user-registration",
  async (job) => {
    await registerUser(job.data);
  },
  { connection: db.redisConnection }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

processUsers();
