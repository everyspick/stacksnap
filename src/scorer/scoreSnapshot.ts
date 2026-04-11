import { Snapshot } from '../snapshot/snapshot';
import { ToolInfo } from '../detector/types';

export interface ScoreResult {
  total: number;
  max: number;
  percentage: number;
  breakdown: ScoreBreakdown[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface ScoreBreakdown {
  category: string;
  score: number;
  max: number;
  notes: string[];
}

function scoreVersionPresence(tools: ToolInfo[]): ScoreBreakdown {
  const detected = tools.filter(t => t.version !== null).length;
  const notes: string[] = [];
  if (detected < tools.length) {
    const missing = tools.filter(t => t.version === null).map(t => t.name);
    notes.push(`Missing versions: ${missing.join(', ')}`);
  }
  return {
    category: 'Version Presence',
    score: detected,
    max: tools.length,
    notes,
  };
}

function scoreToolDiversity(tools: ToolInfo[]): ScoreBreakdown {
  const unique = new Set(tools.map(t => t.name)).size;
  const score = Math.min(unique, 10);
  const notes: string[] = [];
  if (unique < 3) notes.push('Consider adding more tools to your stack');
  return { category: 'Tool Diversity', score, max: 10, notes };
}

function scoreMetadata(snapshot: Snapshot): ScoreBreakdown {
  let score = 0;
  const notes: string[] = [];
  if (snapshot.id) score += 2;
  if (snapshot.createdAt) score += 2;
  if (snapshot.hostname) score += 3;
  else notes.push('Hostname missing from snapshot');
  if (snapshot.platform) score += 3;
  else notes.push('Platform info missing');
  return { category: 'Metadata Completeness', score, max: 10, notes };
}

function gradeFromPercentage(pct: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (pct >= 90) return 'A';
  if (pct >= 75) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}

export function scoreSnapshot(snapshot: Snapshot): ScoreResult {
  const tools = snapshot.tools ?? [];
  const breakdowns: ScoreBreakdown[] = [
    scoreVersionPresence(tools),
    scoreToolDiversity(tools),
    scoreMetadata(snapshot),
  ];
  const total = breakdowns.reduce((sum, b) => sum + b.score, 0);
  const max = breakdowns.reduce((sum, b) => sum + b.max, 0);
  const percentage = max > 0 ? Math.round((total / max) * 100) : 0;
  return { total, max, percentage, breakdown: breakdowns, grade: gradeFromPercentage(percentage) };
}

export function formatScoreResult(result: ScoreResult): string {
  const lines: string[] = [
    `Stack Score: ${result.total}/${result.max} (${result.percentage}%) — Grade: ${result.grade}`,
    '',
  ];
  for (const b of result.breakdown) {
    lines.push(`  [${b.category}] ${b.score}/${b.max}`);
    for (const note of b.notes) lines.push(`    ⚠ ${note}`);
  }
  return lines.join('\n');
}
