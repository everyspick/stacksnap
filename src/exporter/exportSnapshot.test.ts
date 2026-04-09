import { exportAsJson, exportAsMarkdown, exportAsEnv, exportSnapshot } from "./exportSnapshot";
import { Snapshot } from "../detector/types";
import * as fs from "fs";
import * as path from "path";

const mockSnapshot: Snapshot = {
  capturedAt: new Date("2024-01-15T10:00:00Z").toISOString(),
  platform: "darwin",
  tools: [
    { name: "node", version: "20.11.0", path: "/usr/local/bin/node" },
    { name: "git", version: "2.43.0", path: "/usr/bin/git" },
    { name: "docker", version: undefined, path: undefined },
  ],
};

describe("exportAsJson", () => {
  it("returns valid JSON string", () => {
    const result = exportAsJson(mockSnapshot);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it("includes all tools in output", () => {
    const result = exportAsJson(mockSnapshot);
    const parsed = JSON.parse(result);
    expect(parsed.tools).toHaveLength(3);
  });
});

describe("exportAsMarkdown", () => {
  it("contains markdown table header", () => {
    const result = exportAsMarkdown(mockSnapshot);
    expect(result).toContain("| Tool | Version | Path |");
  });

  it("shows 'not found' for missing versions", () => {
    const result = exportAsMarkdown(mockSnapshot);
    expect(result).toContain("not found");
  });

  it("includes platform info", () => {
    const result = exportAsMarkdown(mockSnapshot);
    expect(result).toContain("darwin");
  });
});

describe("exportAsEnv", () => {
  it("formats tool versions as env vars", () => {
    const result = exportAsEnv(mockSnapshot);
    expect(result).toContain("STACK_NODE_VERSION=20.11.0");
    expect(result).toContain("STACK_GIT_VERSION=2.43.0");
  });

  it("skips tools without a version", () => {
    const result = exportAsEnv(mockSnapshot);
    expect(result).not.toContain("STACK_DOCKER_VERSION");
  });
});

describe("exportSnapshot", () => {
  it("throws on unsupported format", () => {
    expect(() => exportSnapshot(mockSnapshot, "xml" as any)).toThrow(
      "Unsupported export format: xml"
    );
  });

  it("writes file to disk when outputPath is provided", () => {
    const tmpPath = path.join("/tmp", "stacksnap-test-export.md");
    exportSnapshot(mockSnapshot, "markdown", tmpPath);
    expect(fs.existsSync(tmpPath)).toBe(true);
    fs.unlinkSync(tmpPath);
  });

  it("returns content without writing if no outputPath", () => {
    const result = exportSnapshot(mockSnapshot, "json");
    expect(result).toBeTruthy();
    expect(() => JSON.parse(result)).not.toThrow();
  });
});
