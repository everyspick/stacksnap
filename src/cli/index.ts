import { parseArgs } from './parseArgs';
import { captureCommand, showCommand } from './commands';

export async function run(argv: string[]): Promise<void> {
  const { command, options } = parseArgs(argv);

  switch (command) {
    case 'capture':
      await captureCommand(options);
      break;
    case 'show':
      await showCommand(options);
      break;
    case 'help':
      printHelp();
      break;
    default:
      console.error(`Unknown command: "${command}"`);
      printHelp();
      process.exit(1);
  }
}

function printHelp(): void {
  console.log(`
stacksnap — capture and export your dev environment stack

Usage:
  stacksnap [command] [options]

Commands:
  capture   Detect tools and output a snapshot (default)
  show      Load and display an existing snapshot
  help      Show this help message

Options:
  -o, --output <file>    Save snapshot to file
  -f, --format <fmt>     Output format: json | markdown | env (default: json)
  -l, --load <file>      Load snapshot from file (required for 'show')
  -v, --verbose          Enable verbose output
`.trim());
}
