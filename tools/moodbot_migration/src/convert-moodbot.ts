import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { readDir, inputDir, outputDir } from "./config";

import { Token, Secret } from "fernet";

import { env } from "./config";

const secret = new Secret(env.FERNET_KEY);

async function convertMoodbot() {
  const files = await readDir(inputDir);
  console.log(files);

  console.log(files.length, "files to process");

  for (const file of files) {
    console.log(file);

    const data = await readFile(join(inputDir, file), "utf-8");
    const users = JSON.parse(data) as InputUser[];

    console.log(users.length, "users to process");

    const output: OutputUser[] = users.map((user) => {
      const token = new Token({
        secret: secret,
        token: user.hashed_token,
        ttl: 0,
      });
      const decryptedToken = token.decode();

      return {
        name: user.full_name,
        telegramId: Number(user.telegram_id),
        moodleId: Number(user.moodle_id),
        moodleToken: decryptedToken,
      };
    });

    await writeFile(join(outputDir, file), JSON.stringify(output));
  }
}

convertMoodbot();
