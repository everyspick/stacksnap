import { Snapshot } from '../snapshot/snapshot';
import { summarizeSnapshot, formatSummary } from '../summarizer/summarizeSnapshot';
import { scoreSnapshot, formatScoreResult } from '../scorer/scoreSnapshot';
import { lintSnapshot, formatLintResult } from '../linter/lintSnapshot';
import { recommendSnapshot, formatRecommendations } from '../recommender/recommendSnapshot';
import { auditSnapshot, formatAuditResult } from '../auditor/auditSnapshot';
import { ReportOptions, ReportSection, SnapshotReport } from './types';

export function generateReport(
  snapshot: Snapshot,
  options: ReportOptions
): SnapshotReport {
  const sections: ReportSection[] = [];

  if (options.includeSummary !== false) {
    const summary = summarizeSnapshot(snapshot);
    sections.push({ title: 'Summary', content: formatSummary(summary) });
  }

  if (options.includeScore) {
    const score = scoreSnapshot(snapshot);
    sections.push({ title: 'Score', content: formatScoreResult(score) });
  }

  if (options.includeLint) {
    const lint = lintSnapshot(snapshot);
    sections.push({ title: 'Lint', content: formatLintResult(lint) });
  }

  if (options.includeRecommendations) {
    const recs = recommendSnapshot(snapshot);
    sections.push({ title: 'Recommendations', content: formatRecommendations(recs) });
  }

  if (options.includeAudit) {
    const audit = auditSnapshot(snapshot);
    sections.push({ title: 'Audit', content: formatAuditResult(audit) });
  }

  return {
    generatedAt: new Date().toISOString(),
    snapshotId: snapshot.id,
    snapshotLabel: snapshot.label ?? snapshot.id,
    sections,
    format: options.format,
  };
}
