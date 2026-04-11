import { SnapshotTemplate, ApplyTemplateResult } from './types';

export function formatTemplateSummary(template: SnapshotTemplate): string {
  const lines: string[] = [
    `Template: ${template.name} (${template.id})`,
    `Description: ${template.description}`,
    `Tags: ${template.tags.length > 0 ? template.tags.join(', ') : 'none'}`,
    `Required Tools (${template.requiredTools.length}): ${template.requiredTools.join(', ')}`,
    `Created: ${template.createdAt}`,
  ];
  return lines.join('\n');
}

export function formatTemplateTable(templates: SnapshotTemplate[]): string {
  if (templates.length === 0) return 'No templates found.';

  const header = 'ID                            | Name                  | Tools | Tags';
  const separator = '-'.repeat(header.length);
  const rows = templates.map((t) => {
    const id = t.id.padEnd(30);
    const name = t.name.padEnd(21);
    const tools = String(t.requiredTools.length).padEnd(5);
    const tags = t.tags.join(', ') || 'none';
    return `${id} | ${name} | ${tools} | ${tags}`;
  });

  return [header, separator, ...rows].join('\n');
}

export function formatApplyResult(
  template: SnapshotTemplate,
  result: ApplyTemplateResult
): string {
  const lines: string[] = [`Applying template: ${template.name}`];
  if (result.matched.length > 0) {
    lines.push(`  ✔ Matched: ${result.matched.join(', ')}`);
  }
  if (result.missing.length > 0) {
    lines.push(`  ✘ Missing: ${result.missing.join(', ')}`);
  }
  lines.push(result.applied ? '  ✅ Template fully satisfied.' : '  ⚠️  Template not fully satisfied.');
  return lines.join('\n');
}
