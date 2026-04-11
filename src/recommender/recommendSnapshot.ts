import { StackSnapshot } from '../snapshot/snapshot';
import { RecommendationResult, ToolRecommendation } from './types';
import { rules } from './rules';
import { scoreSnapshot } from '../scorer/scoreSnapshot';

export function recommendSnapshot(snapshot: StackSnapshot): RecommendationResult {
  const toolMap: Record<string, string | null> = {};

  for (const tool of snapshot.tools) {
    toolMap[tool.name.toLowerCase()] = tool.version ?? null;
  }

  const recommendations: ToolRecommendation[] = [];

  for (const rule of rules) {
    const result = rule.check(toolMap);
    if (result) {
      recommendations.push(result);
    }
  }

  recommendations.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const scoreBefore = scoreSnapshot(snapshot).percentage;
  const estimatedGain = Math.min(recommendations.length * 5, 30);
  const estimatedScoreAfter = Math.min(scoreBefore + estimatedGain, 100);

  return {
    snapshot_id: snapshot.id,
    generated_at: new Date().toISOString(),
    recommendations,
    score_before: scoreBefore,
    estimated_score_after: estimatedScoreAfter,
  };
}

export function formatRecommendations(result: RecommendationResult): string {
  const lines: string[] = [];

  lines.push(`Recommendations for snapshot: ${result.snapshot_id}`);
  lines.push(`Score: ${result.score_before}% → ~${result.estimated_score_after}% (estimated)`);
  lines.push('');

  if (result.recommendations.length === 0) {
    lines.push('✅ No recommendations — your stack looks great!');
    return lines.join('\n');
  }

  for (const rec of result.recommendations) {
    const badge = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
    lines.push(`${badge} [${rec.category}] ${rec.tool}`);
    lines.push(`   ${rec.reason}`);
  }

  return lines.join('\n');
}
