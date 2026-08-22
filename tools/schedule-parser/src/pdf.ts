import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { PDFParse } from "pdf-parse";

export function extractGroupsFromText(text: string): string[] {
  return [...text.matchAll(/^Group\s+(\S+)/gm)].map((match) => match[1]);
}

export async function extractGroupsFromPdfs(
  directory: string,
): Promise<string[]> {
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter(
      (entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".pdf",
    )
    .map((entry) => entry.name)
    .sort();

  if (files.length === 0) {
    throw new Error(`No PDF files found in ${directory}`);
  }

  const groups = new Set<string>();

  for (const file of files) {
    const parser = new PDFParse({
      data: await readFile(join(directory, file)),
    });

    try {
      const result = await parser.getText();
      for (const group of extractGroupsFromText(result.text)) groups.add(group);
    } finally {
      await parser.destroy();
    }
  }

  return [...groups].sort((left, right) => left.localeCompare(right));
}
