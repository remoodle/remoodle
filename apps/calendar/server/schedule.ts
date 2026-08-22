import type { GroupSchedule, Groups } from "./types.d";

const GROUPS_FILE_NAME = "groups.json";

export async function getGroups(bucket: R2Bucket): Promise<Groups | undefined> {
  return readJson<Groups>(bucket, GROUPS_FILE_NAME);
}

export async function getGroupSchedule(
  bucket: R2Bucket,
  group: string,
): Promise<GroupSchedule | undefined> {
  return readJson<GroupSchedule>(bucket, scheduleObjectName(group));
}

export function putGroups(bucket: R2Bucket, groups: Groups): Promise<R2Object> {
  return putJson(bucket, GROUPS_FILE_NAME, groups);
}

export function putGroupSchedule(
  bucket: R2Bucket,
  group: string,
  schedule: GroupSchedule,
): Promise<R2Object> {
  return putJson(bucket, scheduleObjectName(group), schedule);
}

function scheduleObjectName(group: string): string {
  return `schedules/${encodeURIComponent(group)}.json`;
}

async function readJson<T>(bucket: R2Bucket, key: string): Promise<T | undefined> {
  const object = await bucket.get(key);
  return object ? object.json<T>() : undefined;
}

function putJson(bucket: R2Bucket, key: string, value: unknown): Promise<R2Object> {
  return bucket.put(key, JSON.stringify(value), {
    httpMetadata: { contentType: "application/json" },
  });
}
