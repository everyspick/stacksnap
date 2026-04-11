import { Snapshot } from '../snapshot/snapshot';

export interface LintRule {
  id: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: (snapshot: Snapshot) => boolean;
  message: string;
}

export interface LintIssue {
  ruleId: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  description: string;
}

export interface LintResult {
  passed: boolean;
  issues: LintIssue[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

const defaultRules: LintRule[] = [
  {
    id: 'no-empty-stack',
    description: 'Snapshot must contain at least one tool',
    severity: 'error',
    check: (s) => s.tools.length > 0,
    message: 'Snapshot has no detected tools.',
  },
  {
    id: 'has-node',
    description: 'Stack should include Node.js',
    severity: 'warning',
    check: (s) => s.tools.some((t) => t.name.toLowerCase() === 'node'),
    message: 'No Node.js detected in the stack.',
  },
  {
    id: 'all-versions-present',
    description: 'All tools should have a resolved version',
    severity: 'warning',
    check: (s) => s.tools.every((t) => !!t.version),
    message: 'One or more tools are missing version information.',
  },
  {
    id: 'has-timestamp',
    description: 'Snapshot must have a valid timestamp',
    severity: 'error',
    check: (s) => !!s.timestamp && !isNaN(new Date(s.timestamp).getTime()),
    message: 'Snapshot is missing a valid timestamp.',
  },
  {
    id: 'has-os',
    description: 'Snapshot should capture OS information',
    severity: 'info',
    check: (s) => !!s.os,
    message: 'Snapshot does not include OS information.',
  },
];

export function lintSnapshot(snapshot: Snapshot, rules: LintRule[] = defaultRules): LintResult {
  const issues: LintIssue[] = [];

  for (const rule of rules) {
    if (!rule.check(snapshot)) {
      issues.push({
        ruleId: rule.id,
        severity: rule.severity,
        message: rule.message,
        description: rule.description,
      });
    }
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;
  const infoCount = issues.filter((i) => i.severity === 'info').length;

  return {
    passed: errorCount === 0,
    issues,
    errorCount,
    warningCount,
    infoCount,
  };
}

export function formatLintResult(result: LintResult): string {
  const lines: string[] = [];
  const status = result.passed ? '✅ PASSED' : '❌ FAILED';
  lines.push(`Lint Result: ${status}`);
  lines.push(`  Errors: ${result.errorCount}, Warnings: ${result.warningCount}, Info: ${result.infoCount}`);

  if (result.issues.length === 0) {
    lines.push('  No issues found.');
  } else {
    lines.push('');
    for (const issue of result.issues) {
      const icon = issue.severity === 'error' ? '✖' : issue.severity === 'warning' ? '⚠' : 'ℹ';
      lines.push(`  ${icon} [${issue.ruleId}] ${issue.message}`);
    }
  }

  return lines.join('\n');
}
