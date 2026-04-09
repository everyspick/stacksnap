export type OutputFormat = 'json' | 'markdown' | 'env';

export interface CliOptions {
  output?: string;
  format?: OutputFormat;
  load?: string;
  verbose?: boolean;
}

export interface CliCommand {
  name: string;
  description: string;
  handler: (options: CliOptions) => Promise<void>;
}
