import { StackSnapshot } from '../detector/types';
import { DiffResult } from '../differ/diffSnapshots';

export type NotifyChannel = 'console' | 'file' | 'webhook';

export interface NotifyOptions {
  channel: NotifyChannel;
  webhookUrl?: string;
  outputPath?: string;
}

export interface NotifyPayload {
  timestamp: string;
  message: string;
  diff: DiffResult;
}

export function buildPayload(diff: DiffResult): NotifyPayload {
  const added = diff.added.length;
  const removed = diff.removed.length;
  const changed = diff.changed.length;

  const parts: string[] = [];
  if (added > 0) parts.push(`${added} tool(s) added`);
  if (removed > 0) parts.push(`${removed} tool(s) removed`);
  if (changed > 0) parts.push(`${changed} tool(s) changed`);

  const message =
    parts.length > 0
      ? `Stack changed: ${parts.join(', ')}.`
      : 'No changes detected in stack.';

  return {
    timestamp: new Date().toISOString(),
    message,
    diff,
  };
}

export async function notifyChange(
  diff: DiffResult,
  options: NotifyOptions
): Promise<void> {
  const payload = buildPayload(diff);

  if (options.channel === 'console') {
    console.log(`[stacksnap] ${payload.timestamp} — ${payload.message}`);
    return;
  }

  if (options.channel === 'file') {
    if (!options.outputPath) throw new Error('outputPath required for file channel');
    const { writeFileSync } = await import('fs');
    writeFileSync(options.outputPath, JSON.stringify(payload, null, 2), 'utf-8');
    return;
  }

  if (options.channel === 'webhook') {
    if (!options.webhookUrl) throw new Error('webhookUrl required for webhook channel');
    const response = await fetch(options.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Webhook request failed with status ${response.status}`);
    }
    return;
  }

  throw new Error(`Unknown notification channel: ${options.channel}`);
}
