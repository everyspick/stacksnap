import { parseArgs } from './parseArgs';

describe('parseArgs', () => {
  const base = ['node', 'stacksnap'];

  it('defaults to capture command with no args', () => {
    const { command, options } = parseArgs(base);
    expect(command).toBe('capture');
    expect(options).toEqual({});
  });

  it('parses the show command', () => {
    const { command } = parseArgs([...base, 'show', '--load', 'snap.json']);
    expect(command).toBe('show');
  });

  it('parses --output flag', () => {
    const { options } = parseArgs([...base, 'capture', '--output', 'out.json']);
    expect(options.output).toBe('out.json');
  });

  it('parses -o shorthand', () => {
    const { options } = parseArgs([...base, 'capture', '-o', 'out.json']);
    expect(options.output).toBe('out.json');
  });

  it('parses --format flag', () => {
    const { options } = parseArgs([...base, 'capture', '--format', 'markdown']);
    expect(options.format).toBe('markdown');
  });

  it('parses --verbose flag', () => {
    const { options } = parseArgs([...base, 'capture', '--verbose']);
    expect(options.verbose).toBe(true);
  });

  it('parses --load flag', () => {
    const { options } = parseArgs([...base, 'show', '--load', 'snap.json']);
    expect(options.load).toBe('snap.json');
  });

  it('throws on invalid format', () => {
    expect(() =>
      parseArgs([...base, 'capture', '--format', 'xml'])
    ).toThrow('Invalid format');
  });

  it('parses combined flags', () => {
    const { command, options } = parseArgs([
      ...base, 'capture', '-f', 'env', '-o', 'stack.env', '-v'
    ]);
    expect(command).toBe('capture');
    expect(options.format).toBe('env');
    expect(options.output).toBe('stack.env');
    expect(options.verbose).toBe(true);
  });
});
