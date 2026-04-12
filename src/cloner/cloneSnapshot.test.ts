import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import {
  cloneSnapshot,
  buildClonePath,
  formatCloneResult,
} from "./cloneSnapshot";
import { saveSnapshot } from "../snapshot/snapshot";
import { Snapshot } from "../snapshot/snapshot";

function makeTempFile(name: string): string {
  return path.join(os.tmpdir(), `stacksnap-clone-test-${name}-${Date.now()}.json`);
}

function makeSnapshot(): Snapshot {
  return {
    tools: [
      { name: "node", version: "20.0.0", category: "runtime" },
      { name: "npm", version: "10.0.0", category: "package-manager" },
    ],
    metadata: { createdAt: "2024-01-01T00:00:00.000Z", label: "test" },
  };
}

describe("buildClonePath", () => {
  it("appends suffix before extension", () => {
    const result = buildClonePath("/tmp/snap.json", "-copy");
    expect(result).toBe("/tmp/snap-copy.json");
  });

  it("handles paths without extension", () => {
    const result = buildClonePath("/tmp/snap", "-copy");
    expect(result).toBe("/tmp/snap-copy");
  });
});

describe("cloneSnapshot", () => {
  it("returns error if source does not exist", () => {
    const result = cloneSnapshot("/nonexistent/snap.json", "/tmp/dest.json");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Source snapshot not found");
  });

  it("clones snapshot to destination", () => {
    const src = makeTempFile("src");
    const dest = makeTempFile("dest");
    saveSnapshot(makeSnapshot(), src);

    const result = cloneSnapshot(src, dest);
    expect(result.success).toBe(true);
    expect(fs.existsSync(dest)).toBe(true);

    const raw = JSON.parse(fs.readFileSync(dest, "utf-8"));
    expect(raw.metadata.label).toBe("test-clone");

    fs.unlinkSync(src);
    fs.unlinkSync(dest);
  });

  it("does not overwrite by default", () => {
    const src = makeTempFile("src2");
    const dest = makeTempFile("dest2");
    saveSnapshot(makeSnapshot(), src);
    saveSnapshot(makeSnapshot(), dest);

    const result = cloneSnapshot(src, dest);
    expect(result.success).toBe(false);
    expect(result.message).toContain("Destination already exists");

    fs.unlinkSync(src);
    fs.unlinkSync(dest);
  });

  it("overwrites when option is set", () => {
    const src = makeTempFile("src3");
    const dest = makeTempFile("dest3");
    saveSnapshot(makeSnapshot(), src);
    saveSnapshot(makeSnapshot(), dest);

    const result = cloneSnapshot(src, dest, { overwrite: true });
    expect(result.success).toBe(true);

    fs.unlinkSync(src);
    fs.unlinkSync(dest);
  });
});

describe("formatCloneResult", () => {
  it("formats success result", () => {
    const output = formatCloneResult({
      success: true,
      sourcePath: "/a.json",
      clonedPath: "/b.json",
      message: "ok",
    });
    expect(output).toContain("✅");
    expect(output).toContain("/a.json");
    expect(output).toContain("/b.json");
  });

  it("formats failure result", () => {
    const output = formatCloneResult({
      success: false,
      sourcePath: "/a.json",
      clonedPath: "/b.json",
      message: "something went wrong",
    });
    expect(output).toContain("❌");
    expect(output).toContain("something went wrong");
  });
});
