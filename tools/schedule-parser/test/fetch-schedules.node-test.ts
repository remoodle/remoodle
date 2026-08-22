import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { FetchSchedulesCommand } from "../src/commands/fetch-schedules.js";

test("writes one schedule file per group", async () => {
  const directory = await mkdtemp(join(tmpdir(), "schedule-parser-"));
  const groupsFile = join(directory, "groups.json");
  const outputDirectory = join(directory, "schedules");
  await writeFile(groupsFile, JSON.stringify(["SE-2401", "CS/2402"]));

  try {
    const command = new FetchSchedulesCommand({
      scheduleForGroup: async () => [],
    });

    const count = await command.run({
      groupsFile,
      outputDirectory,
      concurrency: 2,
    });

    assert.equal(count, 2);
    assert.deepEqual(
      JSON.parse(await readFile(join(outputDirectory, "SE-2401.json"), "utf8")),
      [],
    );
    assert.deepEqual(
      JSON.parse(
        await readFile(join(outputDirectory, "CS%2F2402.json"), "utf8"),
      ),
      [],
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
