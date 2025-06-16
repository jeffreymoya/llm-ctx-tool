import { parseProject } from '../commands/parse.ts';

describe('parseProject', () => {
  it('runs parse (expected use)', () => {
    const logger = jest.fn();
    const code = parseProject({ logger });
    expect(logger).toHaveBeenCalledWith('Parse command not yet implemented.');
    expect(code).toBe(0);
  });

  it('runs parse in dry-run mode (edge case)', () => {
    const logger = jest.fn();
    const code = parseProject({ dryRun: true, logger });
    expect(logger).toHaveBeenCalledWith('Parse command not yet implemented.');
    expect(code).toBe(0);
  });

  it('handles logger throwing (failure case)', () => {
    const logger = () => {
      throw new Error('fail');
    };
    expect(() => parseProject({ logger })).toThrow('fail');
  });
});
