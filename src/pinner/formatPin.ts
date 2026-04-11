import { PinnedTool } from './types';

export function formatPinSummary(pin: PinnedTool): string {
  const lines: string[] = [
    `Tool:     ${pin.name}`,
    `Pinned:   ${pin.pinnedVersion}`,
    `Detected: ${pin.detectedVersion ?? 'unknown'}`,
    `Since:    ${pin.pinnedAt}`,
  ];
  if (pin.note) {
    lines.push(`Note:     ${pin.note}`);
  }
  return lines.join('\n');
}

export function formatPinTable(pins: PinnedTool[]): string {
  if (pins.length === 0) return 'No pinned tools.';

  const header = `${'Tool'.padEnd(20)} ${'Pinned'.padEnd(15)} ${'Detected'.padEnd(15)} Pinned At`;
  const separator = '-'.repeat(header.length);
  const rows = pins.map(p =>
    `${p.name.padEnd(20)} ${p.pinnedVersion.padEnd(15)} ${(p.detectedVersion ?? 'unknown').padEnd(15)} ${p.pinnedAt}`
  );
  return [header, separator, ...rows].join('\n');
}

export function formatViolations(
  violations: { tool: string; expected: string; actual: string | null }[]
): string {
  if (violations.length === 0) return 'All pinned tools match expected versions.';
  const lines = violations.map(
    v => `  ✗ ${v.tool}: expected ${v.expected}, got ${v.actual ?? 'not found'}`
  );
  return `Pin violations detected:\n${lines.join('\n')}`;
}
