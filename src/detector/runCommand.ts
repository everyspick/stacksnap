import { execSync } from "child_process";

export function runCommand(command: string): string | null {
  try {
    const output = execSync(command, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 5000,
    });
    return output.toString().trim();
  } catch {
    return null;
  }
}

export function which(binary: string): string | null {
  const cmd = process.platform === "win32" ? `where ${binary}` : `which ${binary}`;
  return runCommand(cmd);
}
