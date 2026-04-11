import { LintRule } from './lintSnapshot';

export const strictRules: LintRule[] = [
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
    severity: 'error',
    check: (s) => s.tools.some((t) => t.name.toLowerCase() === 'node'),
    message: 'No Node.js detected in the stack.',
  },
  {
    id: 'all-versions-present',
    description: 'All tools should have a resolved version',
    severity: 'error',
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
    severity: 'error',
    check: (s) => !!s.os,
    message: 'Snapshot does not include OS information.',
  },
  {
    id: 'min-tools',
    description: 'Stack should have at least 3 tools',
    severity: 'warning',
    check: (s) => s.tools.length >= 3,
    message: 'Stack has fewer than 3 tools — may be incomplete.',
  },
];

export const minimalRules: LintRule[] = [
  {
    id: 'no-empty-stack',
    description: 'Snapshot must contain at least one tool',
    severity: 'error',
    check: (s) => s.tools.length > 0,
    message: 'Snapshot has no detected tools.',
  },
  {
    id: 'has-timestamp',
    description: 'Snapshot must have a valid timestamp',
    severity: 'error',
    check: (s) => !!s.timestamp && !isNaN(new Date(s.timestamp).getTime()),
    message: 'Snapshot is missing a valid timestamp.',
  },
];
