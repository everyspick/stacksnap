import { Snapshot } from '../detector/types';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditFinding {
  tool: string;
  severity: AuditSeverity;
  message: string;
  suggestion?: string;
}

export interface AuditResult {
  snapshot: Snapshot;
  findings: AuditFinding[];
  passed: number;
  warned: number;
  critical: number;
  auditedAt: string;
}

const KNOWN_EOL_TOOLS: Record<string, string> = {
  node: '12',
  python: '3.7',
  ruby: '2.6',
};

const RECOMMENDED_TOOLS = ['node', 'git', 'docker'];

export function auditSnapshot(snapshot: Snapshot): AuditResult {
  const findings: AuditFinding[] = [];

  for (const tool of snapshot.tools) {
    const eolVersion = KNOWN_EOL_TOOLS[tool.name.toLowerCase()];
    if (eolVersion && tool.version) {
      const major = parseInt(tool.version.split('.')[0], 10);
      const eolMajor = parseInt(eolVersion.split('.')[0], 10);
      if (major <= eolMajor) {
        findings.push({
          tool: tool.name,
          severity: 'critical',
          message: `${tool.name} v${tool.version} is end-of-life (EOL threshold: v${eolVersion})`,
          suggestion: `Upgrade ${tool.name} to a supported version.`,
        });
      }
    }

    if (!tool.version) {
      findings.push({
        tool: tool.name,
        severity: 'warning',
        message: `${tool.name} has no detected version`,
        suggestion: `Ensure ${tool.name} is properly installed and accessible in PATH.`,
      });
    }
  }

  const detectedNames = snapshot.tools.map((t) => t.name.toLowerCase());
  for (const rec of RECOMMENDED_TOOLS) {
    if (!detectedNames.includes(rec)) {
      findings.push({
        tool: rec,
        severity: 'info',
        message: `Recommended tool "${rec}" was not detected in this snapshot`,
        suggestion: `Consider installing ${rec} for a more complete dev environment.`,
      });
    }
  }

  return {
    snapshot,
    findings,
    passed: snapshot.tools.length - findings.filter((f) => f.severity !== 'info').length,
    warned: findings.filter((f) => f.severity === 'warning').length,
    critical: findings.filter((f) => f.severity === 'critical').length,
    auditedAt: new Date().toISOString(),
  };
}

export function formatAuditResult(result: AuditResult): string {
  const lines: string[] = [];
  lines.push(`Audit Report — ${result.auditedAt}`);
  lines.push(`Tools audited: ${result.snapshot.tools.length} | Passed: ${result.passed} | Warnings: ${result.warned} | Critical: ${result.critical}`);
  lines.push('');

  if (result.findings.length === 0) {
    lines.push('✅ No issues found.');
    return lines.join('\n');
  }

  for (const finding of result.findings) {
    const icon = finding.severity === 'critical' ? '🔴' : finding.severity === 'warning' ? '🟡' : 'ℹ️';
    lines.push(`${icon} [${finding.severity.toUpperCase()}] ${finding.tool}: ${finding.message}`);
    if (finding.suggestion) {
      lines.push(`   → ${finding.suggestion}`);
    }
  }

  return lines.join('\n');
}
