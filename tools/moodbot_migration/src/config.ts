import { cleanEnv, num, str } from "envalid";
import "dotenv/config";

export const env = cleanEnv(process.env, {
  API_URL: str(),
  API_SECRET: str(),

  REDIS_URI: str({ default: "redis://localhost:6379" }),

  FERNET_KEY: str(),
});

import { readFile, writeFile } from "node:fs/promises";
import { readdir } from "node:fs";
import { join } from "node:path";

export const inputDir = join(__dirname, "../data/input");
export const outputDir = join(__dirname, "../data/output");

export function readDir(dir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}
