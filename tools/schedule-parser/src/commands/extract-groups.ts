import { writeJson } from "../files.js";
import { extractGroupsFromPdfs } from "../pdf.js";

export type ExtractGroupsOptions = {
  inputDirectory: string;
  outputFile: string;
};

export class ExtractGroupsCommand {
  async run(options: ExtractGroupsOptions): Promise<number> {
    const groups = await extractGroupsFromPdfs(options.inputDirectory);
    await writeJson(options.outputFile, groups);
    return groups.length;
  }
}
