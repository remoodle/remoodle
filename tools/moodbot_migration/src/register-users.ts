import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";

import { Queue, Worker, Job } from "bullmq";
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

type JobData = OutputUser & {};

async function registerUser(job: Job<JobData>): Promise<void> {
  const user = job.data;

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
    throw new Error(
      `Failed to register user, HTTP error, status: ${response.status}`
    );
  }
}

const worker = new Worker(
  "user-registration",
  async (job) => {
    await registerUser(job);
  },
  { connection: db.redisConnection }
);

worker.on("completed", (job) => {
  const user = job.data;

  console.log(`${job.id} | User ${user.name} registered successfully`);
});

worker.on("failed", (job, err) => {
  const user = job?.data;

  console.error(`${job?.id} | Failed to register user ${user?.name}:`, err);
});

async function processUsers() {
  const files = await readDir(outputDir);
  console.log(files);

  const file = files[0];

  const data = await readFile(join(outputDir, file), "utf-8");

  const users = JSON.parse(data) as OutputUser[];

  console.log(users.length, "users to process");

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map((user) => {
        let data: JobData = {
          ...user,
        };

        registrationQueue.add("register", data);
      })
    );
  }
}

const main = async () => {
  try {
    await processUsers();

    console.log("All users queued for registration");
  } catch (error) {
    console.error("Error processing users:", error);
  }
};

main();
