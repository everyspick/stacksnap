import { Snapshot } from '../snapshot/snapshot';
import { ToolInfo } from '../detector/types';

export interface FilterOptions {
  tools?: string[];
  minVersion?: string;
  hasVersion?: boolean;
  namePattern?: RegExp | string;
}

/**
 * Filters snapshot tools by name (exact match from a list).
 */
export function filterByTools(snapshot: Snapshot, tools: string[]): Snapshot {
  const normalised = tools.map((t) => t.toLowerCase());
  return {
    ...snapshot,
    tools: snapshot.tools.filter((t) => normalised.includes(t.name.toLowerCase())),
  };
}

/**
 * Filters snapshot tools to only those that have a detected version.
 */
export function filterByVersionPresence(snapshot: Snapshot, hasVersion: boolean): Snapshot {
  return {
    ...snapshot,
    tools: snapshot.tools.filter((t) =>
      hasVersion ? t.version !== null && t.version !== undefined : !t.version
    ),
  };
}

/**
 * Filters snapshot tools whose name matches a pattern.
 */
export function filterByNamePattern(snapshot: Snapshot, pattern: RegExp | string): Snapshot {
  const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;
  return {
    ...snapshot,
    tools: snapshot.tools.filter((t) => regex.test(t.name)),
  };
}

/**
 * Applies all provided filter options to a snapshot, returning a new filtered snapshot.
 */
export function filterSnapshot(snapshot: Snapshot, options: FilterOptions): Snapshot {
  let result = { ...snapshot, tools: [...snapshot.tools] };

  if (options.tools && options.tools.length > 0) {
    result = filterByTools(result, options.tools);
  }

  if (options.hasVersion !== undefined) {
    result = filterByVersionPresence(result, options.hasVersion);
  }

  if (options.namePattern !== undefined) {
    result = filterByNamePattern(result, options.namePattern);
  }

  return result;
}
