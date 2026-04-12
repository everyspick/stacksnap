import * as fs from "fs";
import * as path from "path";
import { Snapshot } from "../snapshot/snapshot";
import { loadSnapshot, saveSnapshot } from "../snapshot/snapshot";

export interface CloneOptions {
  suffix?: string;
  overwrite?: boolean;
}

export interface CloneResult {
  success: boolean;
  sourcePath: string;
  clonedPath: string;
  message: string;
}

export function buildClonePath(sourcePath: string, suffix: string): string {
  const dir = path.dirname(sourcePath);
  const ext = path.extname(sourcePath);
  const base = path.basename(sourcePath, ext);
  return path.join(dir, `${base}${suffix}${ext}`);
}

export function cloneSnapshot(
  sourcePath: string,
  destPath: string,
  options: CloneOptions = {}
): CloneResult {
  const { overwrite = false } = options;

  if (!fs.existsSync(sourcePath)) {
    return {
      success: false,
      sourcePath,
      clonedPath: destPath,
      message: `Source snapshot not found: ${sourcePath}`,
    };
  }

  if (fs.existsSync(destPath) && !overwrite) {
    return {
      success: false,
      sourcePath,
      clonedPath: destPath,
      message: `Destination already exists: ${destPath}. Use overwrite option to replace.`,
    };
  }

  const snapshot = loadSnapshot(sourcePath);
  const cloned: Snapshot = {
    ...snapshot,
    metadata: {
      ...snapshot.metadata,
      createdAt: new Date().toISOString(),
      label: snapshot.metadata?.label
        ? `${snapshot.metadata.label}-clone`
        : "clone",
    },
  };

  saveSnapshot(cloned, destPath);

  return {
    success: true,
    sourcePath,
    clonedPath: destPath,
    message: `Snapshot cloned successfully to ${destPath}`,
  };
}

export function formatCloneResult(result: CloneResult): string {
  if (!result.success) {
    return `❌ Clone failed: ${result.message}`;
  }
  return [
    `✅ Snapshot cloned`,
    `   Source : ${result.sourcePath}`,
    `   Cloned : ${result.clonedPath}`,
  ].join("\n");
}
