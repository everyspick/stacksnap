import { detectStack } from '../detector/detectTools';
import { createSnapshot, serializeSnapshot, saveSnapshot, loadSnapshot } from '../snapshot/snapshot';
import { exportSnapshot } from '../exporter/exportSnapshot';
import { CliOptions, OutputFormat } from './types';

export async function captureCommand(options: CliOptions): Promise<void> {
  if (options.verbose) {
    console.log('Detecting tools in your environment...');
  }

  const tools = await detectStack();
  const snapshot = createSnapshot(tools);

  if (options.verbose) {
    console.log(`Detected ${tools.length} tool(s).`);
  }

  const format: OutputFormat = options.format ?? 'json';
  const result = exportSnapshot(snapshot, format);

  if (options.output) {
    await saveSnapshot(options.output, serializeSnapshot(snapshot));
    console.log(`Snapshot saved to ${options.output}`);
  } else {
    console.log(result);
  }
}

export async function showCommand(options: CliOptions): Promise<void> {
  if (!options.load) {
    throw new Error('--load <file> is required for the show command');
  }

  const raw = await loadSnapshot(options.load);
  const format: OutputFormat = options.format ?? 'json';
  const result = exportSnapshot(raw, format);
  console.log(result);
}
