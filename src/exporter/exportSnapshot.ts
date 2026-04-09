import * as fs from "fs";
import * as path from "path";
import { Snapshot } from "../detector/types";

export type ExportFormat = "json" | "markdown" | "env";

export function exportAsJson(snapshot: Snapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export function exportAsMarkdown(snapshot: Snapshot): string {
  const lines: string[] = [
    `# Stack Snapshot`,
    ``,
    `**Captured:** ${new Date(snapshot.capturedAt).toLocaleString()}`,
    `**Platform:** ${snapshot.platform}`,
    ``,
    `## Tools`,
    ``,
    `| Tool | Version | Path |`,
    `|------|---------|------|`,
  ];

  for (const tool of snapshot.tools) {
    const version = tool.version ?? "not found";
    const toolPath = tool.path ?? "—";
    lines.push(`| ${tool.name} | ${version} | ${toolPath} |`);
  }

  return lines.join("\n");
}

export function exportAsEnv(snapshot: Snapshot): string {
  const lines: string[] = [
    `# Stack Snapshot — ${new Date(snapshot.capturedAt).toLocaleString()}`,
  ];

  for (const tool of snapshot.tools) {
    if (tool.version) {
      const key = `STACK_${tool.name.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_VERSION`;
      lines.push(`${key}=${tool.version}`);
    }
  }

  return lines.join("\n");
}

export function exportSnapshot(
  snapshot: Snapshot,
  format: ExportFormat,
  outputPath?: string
): string {
  let content: string;

  switch (format) {
    case "json":
      content = exportAsJson(snapshot);
      break;
    case "markdown":
      content = exportAsMarkdown(snapshot);
      break;
    case "env":
      content = exportAsEnv(snapshot);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  if (outputPath) {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, content, "utf-8");
  }

  return content;
}
