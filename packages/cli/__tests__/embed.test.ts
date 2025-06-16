import { embedProject } from '../commands/embed.ts';

describe('embedProject', () => {
  it('runs embed (expected use)', () => {
    const logger = jest.fn();
    const code = embedProject({ logger });
    expect(logger).toHaveBeenCalledWith('Embed command not yet implemented.');
    expect(code).toBe(0);
  });

  it('runs embed in dry-run mode (edge case)', () => {
    const logger = jest.fn();
    const code = embedProject({ dryRun: true, logger });
    expect(logger).toHaveBeenCalledWith('Embed command not yet implemented.');
    expect(code).toBe(0);
  });

  it('handles logger throwing (failure case)', () => {
    const logger = () => {
      throw new Error('fail');
    };
    expect(() => embedProject({ logger })).toThrow('fail');
  });
});
