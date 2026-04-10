import { Snapshot } from '../snapshot/snapshot';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  name: string;
  check: (snapshot: Snapshot) => { pass: boolean; message?: string };
  severity: 'error' | 'warning';
}

const rules: ValidationRule[] = [
  {
    name: 'has-tools',
    check: (s) => ({
      pass: s.tools.length > 0,
      message: 'Snapshot contains no detected tools',
    }),
    severity: 'warning',
  },
  {
    name: 'has-timestamp',
    check: (s) => ({
      pass: typeof s.timestamp === 'string' && s.timestamp.length > 0,
      message: 'Snapshot is missing a timestamp',
    }),
    severity: 'error',
  },
  {
    name: 'has-hostname',
    check: (s) => ({
      pass: typeof s.hostname === 'string' && s.hostname.length > 0,
      message: 'Snapshot is missing a hostname',
    }),
    severity: 'error',
  },
  {
    name: 'tools-have-versions',
    check: (s) => {
      const missing = s.tools.filter((t) => !t.version || t.version === 'unknown');
      return {
        pass: missing.length === 0,
        message:
          missing.length > 0
            ? `Tools missing version info: ${missing.map((t) => t.name).join(', ')}`
            : undefined,
      };
    },
    severity: 'warning',
  },
  {
    name: 'tools-are-present',
    check: (s) => {
      const absent = s.tools.filter((t) => !t.present);
      return {
        pass: absent.length === 0,
        message:
          absent.length > 0
            ? `Tools not found on system: ${absent.map((t) => t.name).join(', ')}`
            : undefined,
      };
    },
    severity: 'warning',
  },
];

export function validateSnapshot(snapshot: Snapshot): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of rules) {
    const result = rule.check(snapshot);
    if (!result.pass && result.message) {
      if (rule.severity === 'error') {
        errors.push(`[${rule.name}] ${result.message}`);
      } else {
        warnings.push(`[${rule.name}] ${result.message}`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];
  if (result.valid) {
    lines.push('✅ Snapshot is valid');
  } else {
    lines.push('❌ Snapshot validation failed');
  }
  if (result.errors.length > 0) {
    lines.push('\nErrors:');
    result.errors.forEach((e) => lines.push(`  • ${e}`));
  }
  if (result.warnings.length > 0) {
    lines.push('\nWarnings:');
    result.warnings.forEach((w) => lines.push(`  • ${w}`));
  }
  return lines.join('\n');
}
