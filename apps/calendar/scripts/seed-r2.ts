import { hc } from "hono/client";
import { readFileSync, readdirSync } from "node:fs";
import { basename, join } from "node:path";
import type { AppType } from "../server/index.ts";

const client = hc<AppType>("http://localhost:5173");
const dataDirectory = "../../tools/schedule-parser/output";

const groups: string[] = JSON.parse(readFileSync(join(dataDirectory, "groups.json"), "utf-8"));
const groupsResponse = await client.api.groups.$put({ json: groups });
if (!groupsResponse.ok) throw new Error(`Failed to upload groups: ${groupsResponse.status}`);

for (const file of readdirSync(join(dataDirectory, "schedules"))) {
  if (!file.endsWith(".json")) continue;

  const group = decodeURIComponent(basename(file, ".json"));
  const schedule = JSON.parse(readFileSync(join(dataDirectory, "schedules", file), "utf-8"));
  const response = await fetch(`http://localhost:5173/api/groups/${encodeURIComponent(group)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schedule),
  });

  if (!response.ok) throw new Error(`Failed to upload ${group}: ${response.status}`);
}

console.log(`Seeded ${groups.length} groups and their schedules`);
