import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectStack } from "./detectTools";
import * as runCommandModule from "./runCommand";

vi.mock("./runCommand", () => ({
  runCommand: vi.fn(),
  which: vi.fn(),
}));

describe("detectStack", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns a DetectedStack shape", () => {
    vi.mocked(runCommandModule.which).mockReturnValue(null);
    const stack = detectStack();
    expect(stack).toHaveProperty("os");
    expect(stack).toHaveProperty("arch");
    expect(stack).toHaveProperty("tools");
    expect(stack).toHaveProperty("detectedAt");
    expect(Array.isArray(stack.tools)).toBe(true);
  });

  it("includes detected tools when which returns a path", () => {
    vi.mocked(runCommandModule.which).mockImplementation((bin) =>
      bin === "node" ? "/usr/local/bin/node" : null
    );
    vi.mocked(runCommandModule.runCommand).mockImplementation((cmd) =>
      cmd.includes("node") ? "v20.11.0" : null
    );

    const stack = detectStack();
    const node = stack.tools.find((t) => t.name === "node");
    expect(node).toBeDefined();
    expect(node?.version).toBe("20.11.0");
    expect(node?.path).toBe("/usr/local/bin/node");
  });

  it("excludes tools that are not installed", () => {
    vi.mocked(runCommandModule.which).mockReturnValue(null);
    const stack = detectStack();
    expect(stack.tools).toHaveLength(0);
  });

  it("detectedAt is a valid ISO string", () => {
    vi.mocked(runCommandModule.which).mockReturnValue(null);
    const stack = detectStack();
    expect(() => new Date(stack.detectedAt)).not.toThrow();
    expect(new Date(stack.detectedAt).toISOString()).toBe(stack.detectedAt);
  });
});
