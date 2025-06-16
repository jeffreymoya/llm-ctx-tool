import fs from 'fs';
import path from 'path';

import { initProject } from '../commands/init.ts';

describe('initProject', () => {
  const testDir = path.join(__dirname, 'tmp-init');
  const configPath = path.join(testDir, '.llmctx/config.json');

  beforeEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('creates config and folders (expected use)', async () => {
    const logger = jest.fn();
    const code = await initProject({ cwd: testDir, logger });
    expect(fs.existsSync(configPath)).toBe(true);
    expect(logger).toHaveBeenCalledWith('Project initialized.');
    expect(code).toBe(0);
  });

  it('prompts on existing config (edge case)', async () => {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, '{}');
    let prompted = false;
    const prompt = () => {
      prompted = true;
      return Promise.resolve(false);
    };
    const logger = jest.fn();
    const code = await initProject({ cwd: testDir, logger, prompt });
    expect(prompted).toBe(true);
    expect(logger).toHaveBeenCalledWith('Aborted. Existing config preserved.');
    expect(code).toBe(1);
  });

  it('handles permission error (failure case)', async () => {
    const logger = jest.fn();
    const badDir = '/root/llmctx-test-no-access';
    const code = await initProject({ cwd: badDir, logger });
    expect(code).not.toBe(0);
    expect(logger).toHaveBeenCalled();
  });
});
