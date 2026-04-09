import { CliOptions, OutputFormat } from './types';

const VALID_FORMATS: OutputFormat[] = ['json', 'markdown', 'env'];

export interface ParsedArgs {
  command: string;
  options: CliOptions;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2);
  const command = args[0] ?? 'capture';
  const options: CliOptions = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if ((arg === '--output' || arg === '-o') && args[i + 1]) {
      options.output = args[++i];
    } else if ((arg === '--format' || arg === '-f') && args[i + 1]) {
      const fmt = args[++i] as OutputFormat;
      if (!VALID_FORMATS.includes(fmt)) {
        throw new Error(`Invalid format "${fmt}". Must be one of: ${VALID_FORMATS.join(', ')}`);
      }
      options.format = fmt;
    } else if ((arg === '--load' || arg === '-l') && args[i + 1]) {
      options.load = args[++i];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  return { command, options };
}
