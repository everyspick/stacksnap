import { RecommendationRule, ToolRecommendation } from './types';

export const rules: RecommendationRule[] = [
  {
    id: 'missing-node',
    description: 'Recommend Node.js if not present',
    check: (tools) => {
      if (!tools['node']) {
        return {
          tool: 'node',
          reason: 'Node.js is widely used for JS/TS development and tooling.',
          priority: 'high',
          category: 'runtime',
        };
      }
      return null;
    },
  },
  {
    id: 'missing-git',
    description: 'Recommend Git if not present',
    check: (tools) => {
      if (!tools['git']) {
        return {
          tool: 'git',
          reason: 'Git is essential for version control.',
          priority: 'high',
          category: 'vcs',
        };
      }
      return null;
    },
  },
  {
    id: 'missing-docker',
    description: 'Recommend Docker for containerization',
    check: (tools) => {
      if (!tools['docker']) {
        return {
          tool: 'docker',
          reason: 'Docker enables consistent containerized environments.',
          priority: 'medium',
          category: 'container',
        };
      }
      return null;
    },
  },
  {
    id: 'missing-package-manager',
    description: 'Recommend a package manager',
    check: (tools) => {
      if (!tools['pnpm'] && !tools['yarn'] && !tools['npm']) {
        return {
          tool: 'pnpm',
          reason: 'A package manager is required for Node.js projects. pnpm is fast and disk-efficient.',
          priority: 'high',
          category: 'package-manager',
        };
      }
      return null;
    },
  },
  {
    id: 'missing-linter',
    description: 'Recommend a linter',
    check: (tools) => {
      if (!tools['eslint'] && !tools['biome']) {
        return {
          tool: 'eslint',
          reason: 'A linter helps maintain code quality and consistency.',
          priority: 'low',
          category: 'linting',
        };
      }
      return null;
    },
  },
];
