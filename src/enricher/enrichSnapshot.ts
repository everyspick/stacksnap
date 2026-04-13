import { Snapshot } from '../detector/types';
import { EnrichedTool, EnrichmentResult } from './types';

// Static enrichment metadata for common tools
const TOOL_METADATA: Record<string, { homepage: string; description: string }> = {
  node: { homepage: 'https://nodejs.org', description: 'JavaScript runtime built on Chrome\'s V8 engine' },
  npm: { homepage: 'https://npmjs.com', description: 'Node package manager' },
  yarn: { homepage: 'https://yarnpkg.com', description: 'Fast, reliable, and secure dependency management' },
  pnpm: { homepage: 'https://pnpm.io', description: 'Fast, disk space efficient package manager' },
  git: { homepage: 'https://git-scm.com', description: 'Distributed version control system' },
  docker: { homepage: 'https://docker.com', description: 'Platform for developing and running containers' },
  python: { homepage: 'https://python.org', description: 'High-level programming language' },
  go: { homepage: 'https://go.dev', description: 'Open source programming language by Google' },
  rust: { homepage: 'https://rust-lang.org', description: 'Systems programming language focused on safety' },
  bun: { homepage: 'https://bun.sh', description: 'Fast all-in-one JavaScript runtime' },
};

export function enrichTool(tool: import('../detector/types').ToolInfo): EnrichedTool {
  const key = tool.name.toLowerCase();
  const meta = TOOL_METADATA[key];
  return {
    ...tool,
    homepage: meta?.homepage,
    description: meta?.description,
    enrichedAt: new Date().toISOString(),
  };
}

export function enrichSnapshot(snapshot: Snapshot): EnrichmentResult {
  const enriched: EnrichedTool[] = [];
  const skipped: string[] = [];

  for (const tool of snapshot.tools) {
    const key = tool.name.toLowerCase();
    if (TOOL_METADATA[key]) {
      enriched.push(enrichTool(tool));
    } else {
      skipped.push(tool.name);
      enriched.push({ ...tool, enrichedAt: new Date().toISOString() });
    }
  }

  return {
    enriched,
    skipped,
    enrichedCount: enriched.filter(t => TOOL_METADATA[t.name.toLowerCase()]).length,
    skippedCount: skipped.length,
  };
}

export function formatEnrichmentResult(result: EnrichmentResult): string {
  const lines: string[] = [
    `Enrichment Summary`,
    `==================`,
    `Enriched: ${result.enrichedCount} tool(s)`,
    `Skipped:  ${result.skippedCount} tool(s)`,
    ``,
    `Enriched Tools:`,
  ];
  for (const tool of result.enriched) {
    if (tool.homepage) {
      lines.push(`  ${tool.name}: ${tool.description ?? ''} (${tool.homepage})`);
    }
  }
  if (result.skipped.length > 0) {
    lines.push(``, `Skipped (no metadata): ${result.skipped.join(', ')}`);
  }
  return lines.join('\n');
}
