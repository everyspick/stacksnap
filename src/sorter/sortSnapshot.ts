import { Snapshot, ToolInfo } from '../detector/types';

export type SortField = 'name' | 'version' | 'category';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order?: SortOrder;
}

export interface SortResult {
  original: ToolInfo[];
  sorted: ToolInfo[];
  field: SortField;
  order: SortOrder;
}

export function sortByName(tools: ToolInfo[], order: SortOrder = 'asc'): ToolInfo[] {
  return [...tools].sort((a, b) => {
    const cmp = a.name.localeCompare(b.name);
    return order === 'asc' ? cmp : -cmp;
  });
}

export function sortByVersion(tools: ToolInfo[], order: SortOrder = 'asc'): ToolInfo[] {
  return [...tools].sort((a, b) => {
    const av = a.version ?? '';
    const bv = b.version ?? '';
    if (!av && !bv) return 0;
    if (!av) return order === 'asc' ? 1 : -1;
    if (!bv) return order === 'asc' ? -1 : 1;
    const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' });
    return order === 'asc' ? cmp : -cmp;
  });
}

export function sortByCategory(tools: ToolInfo[], order: SortOrder = 'asc'): ToolInfo[] {
  return [...tools].sort((a, b) => {
    const ac = a.category ?? 'unknown';
    const bc = b.category ?? 'unknown';
    const cmp = ac.localeCompare(bc);
    return order === 'asc' ? cmp : -cmp;
  });
}

export function sortSnapshot(snapshot: Snapshot, options: SortOptions): SortResult {
  const { field, order = 'asc' } = options;
  const original = snapshot.tools;

  let sorted: ToolInfo[];
  switch (field) {
    case 'name':
      sorted = sortByName(original, order);
      break;
    case 'version':
      sorted = sortByVersion(original, order);
      break;
    case 'category':
      sorted = sortByCategory(original, order);
      break;
    default:
      sorted = [...original];
  }

  return { original, sorted, field, order };
}

export function formatSortResult(result: SortResult): string {
  const lines: string[] = [
    `Sorted by: ${result.field} (${result.order})`,
    `Total tools: ${result.sorted.length}`,
    '',
  ];
  for (const tool of result.sorted) {
    const version = tool.version ? `v${tool.version}` : 'no version';
    const category = tool.category ? ` [${tool.category}]` : '';
    lines.push(`  ${tool.name.padEnd(20)} ${version}${category}`);
  }
  return lines.join('\n');
}
