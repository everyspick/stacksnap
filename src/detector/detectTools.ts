import os from "os";
import { runCommand, which } from "./runCommand";
import type { DetectedStack, DetectorResult, Tool } from "./types";

const TOOL_COMMANDS: Record<string, string> = {
  node: "node --version",
  npm: "npm --version",
  yarn: "yarn --version",
  pnpm: "pnpm --version",
  bun: "bun --version",
  deno: "deno --version",
  python: "python --version",
  python3: "python3 --version",
  go: "go version",
  rust: "rustc --version",
  java: "java --version",
  docker: "docker --version",
  git: "git --version",
};

function extractVersion(output: string | null): string | null {
  if (!output) return null;
  const match = output.match(/(\d+\.\d+[\d.]*)/);
  return match ? match[1] : output.split("\n")[0];
}

function detectTool(name: string, command: string): DetectorResult {
  const toolPath = which(name);
  if (!toolPath) {
    return { success: false, tool: name, version: null, path: null };
  }
  const output = runCommand(command);
  const version = extractVersion(output);
  return { success: true, tool: name, version, path: toolPath };
}

export function detectStack(): DetectedStack {
  const results: Tool[] = [];

  for (const [name, command] of Object.entries(TOOL_COMMANDS)) {
    const result = detectTool(name, command);
    if (result.success) {
      results.push({
        name: result.tool,
        version: result.version,
        path: result.path,
      });
    }
  }

  return {
    os: `${os.type()} ${os.release()}`,
    arch: os.arch(),
    tools: results,
    detectedAt: new Date().toISOString(),
  };
}
