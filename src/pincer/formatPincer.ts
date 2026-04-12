import { ToolPin, PinReport, PinCheckResult } from './types';

export function formatPinSummary(pin: ToolPin): string {
  const note = pin.note ? ` (${pin.note})` : '';
  return `[${pin.tool}] pinned @ ${pin.version}${note} — added ${pin.pinnedAt}`;
}

export function formatPinTable(pins: ToolPin[]): string {
  if (pins.length === 0) return 'No pins defined.';
  const header = 'Tool             | Pinned Version | Note';
  const sep = '-'.repeat(50);
  const rows = pins.map(p => {
    const tool = p.tool.padEnd(16);
    const ver = p.version.padEnd(14);
    const note = p.note ?? '';
    return `${tool} | ${ver} | ${note}`;
  });
  return [header, sep, ...rows].join('\n');
}

function statusIcon(status: PinCheckResult['status']): string {
  if (status === 'ok') return '✓';
  if (status === 'drift') return '⚠';
  return '✗';
}

export function formatPinReport(report: PinReport): string {
  const lines: string[] = [
    `Pin Check Report — ${report.checked} pinned tool(s)`,
    `  OK: ${report.ok}  Drifted: ${report.drifted}  Missing: ${report.missing}`,
    '',
  ];
  for (const r of report.results) {
    const icon = statusIcon(r.status);
    const current = r.currentVersion ?? 'not found';
    lines.push(`  ${icon} ${r.tool}: pinned=${r.pinnedVersion}, current=${current}`);
  }
  return lines.join('\n');
}
