import { Snapshot } from '../snapshot/snapshot';
import { InspectionReport, InspectionResult, InspectionRule } from './types';
import { inspectionRules } from './rules';

export function inspectSnapshot(
  snapshot: Snapshot,
  rules: InspectionRule[] = inspectionRules
): InspectionReport {
  const results: InspectionResult[] = [];

  for (const entry of snapshot.tools) {
    for (const rule of rules) {
      const passed = rule.check(entry.name, entry.version ?? null);
      results.push({
        ruleId: rule.id,
        tool: entry.name,
        version: entry.version ?? null,
        severity: rule.severity,
        passed,
        message: rule.message(entry.name, entry.version ?? null),
      });
    }
  }

  const passCount = results.filter((r) => r.passed).length;
  const warnCount = results.filter((r) => !r.passed && r.severity === 'warning').length;
  const errorCount = results.filter((r) => !r.passed && r.severity === 'error').length;
  const infoCount = results.filter((r) => !r.passed && r.severity === 'info').length;

  return {
    snapshotId: snapshot.id,
    timestamp: new Date().toISOString(),
    results,
    passCount,
    warnCount,
    errorCount,
    infoCount,
  };
}

export function formatInspectionReport(report: InspectionReport): string {
  const lines: string[] = [
    `Inspection Report — Snapshot: ${report.snapshotId}`,
    `Generated: ${report.timestamp}`,
    ``,
    `Summary: ${report.passCount} passed, ${report.errorCount} errors, ${report.warnCount} warnings, ${report.infoCount} info`,
    ``,
  ];

  const failed = report.results.filter((r) => !r.passed);
  if (failed.length === 0) {
    lines.push('✅ All checks passed.');
  } else {
    for (const result of failed) {
      const icon = result.severity === 'error' ? '❌' : result.severity === 'warning' ? '⚠️' : 'ℹ️';
      lines.push(`${icon} [${result.ruleId}] ${result.tool}: ${result.message}`);
    }
  }

  return lines.join('\n');
}
