import { InspectionRule } from './types';

export const inspectionRules: InspectionRule[] = [
  {
    id: 'version-present',
    description: 'Tool should have a detectable version',
    severity: 'warning',
    check: (_tool, version) => version !== null,
    message: (tool, version) =>
      version !== null
        ? `${tool} has version ${version}`
        : `${tool} version could not be detected`,
  },
  {
    id: 'no-ancient-node',
    description: 'Node.js should not be older than v14',
    severity: 'error',
    check: (tool, version) => {
      if (tool !== 'node' || version === null) return true;
      const major = parseInt(version.split('.')[0], 10);
      return major >= 14;
    },
    message: (tool, version) =>
      tool === 'node' && version !== null
        ? `Node.js v${version} is ${parseInt(version.split('.')[0], 10) < 14 ? 'too old (< v14)' : 'acceptable'}`
        : `Node.js version check skipped`,
  },
  {
    id: 'semver-format',
    description: 'Version should follow semver format',
    severity: 'info',
    check: (_tool, version) => {
      if (version === null) return true;
      return /^\d+\.\d+(\.\d+)?/.test(version);
    },
    message: (tool, version) =>
      version !== null && /^\d+\.\d+(\.\d+)?/.test(version)
        ? `${tool} version ${version} follows semver`
        : `${tool} version "${version}" does not follow semver format`,
  },
  {
    id: 'package-manager-present',
    description: 'At least one package manager (npm, yarn, pnpm) should be present',
    severity: 'warning',
    check: (tool, version) => {
      const pkgManagers = ['npm', 'yarn', 'pnpm'];
      return pkgManagers.includes(tool) ? version !== null : true;
    },
    message: (tool, version) =>
      ['npm', 'yarn', 'pnpm'].includes(tool)
        ? version !== null
          ? `${tool} is available (${version})`
          : `${tool} is listed but version is missing`
        : `${tool} is not a package manager`,
  },
];
