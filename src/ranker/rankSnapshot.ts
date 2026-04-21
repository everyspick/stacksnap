import { Snapshot, ToolEntry } from '../detector/types';

export interface RankEntry {
  tool: ToolEntry;
  score: number;
  rank: number;
  reasons: string[];
}

export interface RankResult {
  ranked: RankEntry[];
  strategy: string;
  total: number;
}

function scoreByVersion(tool: ToolEntry): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  if (tool.version) {
    score += 40;
    reasons.push('version detected (+40)');
    const semver = /^\d+\.\d+\.\d+/.test(tool.version);
    if (semver) {
      score += 20;
      reasons.push('semver format (+20)');
    }
  } else {
    reasons.push('no version detected (+0)');
  }
  return { score, reasons };
}

function scoreByCategory(tool: ToolEntry): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  if (tool.category) {
    score += 20;
    reasons.push(`category present (+20)`);
  }
  return { score, reasons };
}

function scoreByName(tool: ToolEntry): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  if (tool.name && tool.name.length > 0) {
    score += 20;
    reasons.push('name present (+20)');
  }
  return { score, reasons };
}

export function rankSnapshot(
  snapshot: Snapshot,
  strategy: 'score' | 'alpha' | 'category' = 'score'
): RankResult {
  const entries: RankEntry[] = snapshot.tools.map((tool) => {
    const v = scoreByVersion(tool);
    const c = scoreByCategory(tool);
    const n = scoreByName(tool);
    const score = v.score + c.score + n.score;
    const reasons = [...v.reasons, ...c.reasons, ...n.reasons];
    return { tool, score, rank: 0, reasons };
  });

  if (strategy === 'alpha') {
    entries.sort((a, b) => a.tool.name.localeCompare(b.tool.name));
  } else if (strategy === 'category') {
    entries.sort((a, b) =>
      (a.tool.category ?? '').localeCompare(b.tool.category ?? '')
    );
  } else {
    entries.sort((a, b) => b.score - a.score);
  }

  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  return { ranked: entries, strategy, total: entries.length };
}

export function formatRankResult(result: RankResult): string {
  const lines: string[] = [
    `Rank Results (strategy: ${result.strategy}, total: ${result.total})`,
    '─'.repeat(52),
  ];
  for (const entry of result.ranked) {
    const ver = entry.tool.version ?? 'unknown';
    const cat = entry.tool.category ?? 'uncategorized';
    lines.push(
      `#${String(entry.rank).padEnd(3)} ${entry.tool.name.padEnd(20)} v${ver.padEnd(12)} [${cat}] score: ${entry.score}`
    );
  }
  return lines.join('\n');
}
