#!/usr/bin/env node

import { parseArgs } from "node:util";
import { ExtractGroupsCommand } from "./commands/extract-groups.js";
import { FetchSchedulesCommand } from "./commands/fetch-schedules.js";
import { DuScheduleClient } from "./du.js";

const help = `schedule-parser - build calendar schedule data

Usage:
  pnpm groups [--input <directory>] [--output <file>]
  pnpm schedule [--groups <file>] [--output <directory>] [--concurrency <count>]

Commands:
  groups      Extract group names from PDF files into groups.json
  schedule    Fetch each group schedule into a separate JSON file

The schedule command reads the DU_TOKEN environment variable.
`;

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      input: { type: "string", default: "../../external/aitu/schedule" },
      groups: { type: "string", default: "output/groups.json" },
      output: { type: "string" },
      concurrency: { type: "string", default: "10" },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help) {
    process.stdout.write(help);
    return;
  }

  const command = positionals[0];
  if (positionals.length !== 1) throw new Error(help);

  if (command === "groups") {
    const outputFile = values.output ?? "output/groups.json";
    const count = await new ExtractGroupsCommand().run({
      inputDirectory: values.input,
      outputFile,
    });
    console.log(`Wrote ${count} groups to ${outputFile}`);
    return;
  }

  if (command === "schedule") {
    const token = process.env.DU_TOKEN?.trim();
    if (!token) throw new Error("DU_TOKEN is required");

    const concurrency = Number.parseInt(values.concurrency, 10);
    if (!Number.isInteger(concurrency) || concurrency < 1) {
      throw new Error("--concurrency must be a positive integer");
    }

    const outputDirectory = values.output ?? "output/schedules";
    const count = await new FetchSchedulesCommand(
      new DuScheduleClient(token),
    ).run({
      groupsFile: values.groups,
      outputDirectory,
      concurrency,
    });
    console.log(`Wrote ${count} group schedules to ${outputDirectory}`);
    return;
  }

  throw new Error(`Unknown command: ${command ?? ""}\n\n${help}`);
}

main().catch((error: unknown) => {
  console.error(
    `schedule-parser: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
