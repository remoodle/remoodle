import type { GroupScheduleItem } from "../model.js";
import { readGroups, replaceScheduleFiles } from "../files.js";

export type ScheduleClient = {
  scheduleForGroup(group: string): Promise<GroupScheduleItem[]>;
};

export type FetchSchedulesOptions = {
  groupsFile: string;
  outputDirectory: string;
  concurrency: number;
};

export class FetchSchedulesCommand {
  constructor(private readonly client: ScheduleClient) {}

  async run(options: FetchSchedulesOptions): Promise<number> {
    const groups = await readGroups(options.groupsFile);
    const schedules = new Map<string, GroupScheduleItem[]>();
    let nextIndex = 0;

    const worker = async () => {
      while (nextIndex < groups.length) {
        const group = groups[nextIndex];
        nextIndex += 1;
        schedules.set(group, await this.client.scheduleForGroup(group));
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(options.concurrency, groups.length) }, () =>
        worker(),
      ),
    );
    await replaceScheduleFiles(options.outputDirectory, schedules);

    return schedules.size;
  }
}
