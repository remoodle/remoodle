import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import * as v from "valibot";
import { GroupsFileSchema } from "./schemas.js";

export async function readGroups(path: string): Promise<string[]> {
  try {
    return v.parse(GroupsFileSchema, await readFile(path, "utf8"));
  } catch (error) {
    throw new Error(`${path} must contain a JSON array of group names`, {
      cause: error,
    });
  }
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export async function replaceScheduleFiles(
  directory: string,
  schedules: ReadonlyMap<string, unknown>,
): Promise<void> {
  await mkdir(directory, { recursive: true });

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".json")) {
      await rm(join(directory, entry.name));
    }
  }

  await Promise.all(
    [...schedules].map(([group, schedule]) =>
      writeJson(join(directory, scheduleFileName(group)), schedule),
    ),
  );
}

export function scheduleFileName(group: string): string {
  return `${encodeURIComponent(group)}.json`;
}
