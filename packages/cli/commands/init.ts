import fs from 'fs';
import path from 'path';
import readline from 'readline';

export interface InitOptions {
  cwd?: string;
  dryRun?: boolean;
  force?: boolean;
  logger?: (msg: string) => void;
  prompt?: (msg: string) => Promise<boolean>;
}

const DEFAULT_CONFIG = {
  project: 'llmctx',
  version: '0.1.0',
  plugins: [],
};

const REQUIRED_DIRS = ['.llmctx', '.llmctx/data'];
const CONFIG_FILE = '.llmctx/config.json';

function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

async function defaultPrompt(msg: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${msg} (y/N): `, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

export async function initProject(options: InitOptions = {}): Promise<number> {
  const cwd = options.cwd ?? process.cwd();
  const logger = options.logger ?? console.log;
  const prompt = options.prompt ?? defaultPrompt;
  const dryRun = options.dryRun ?? false;
  const force = options.force ?? false;

  try {
    const configExists = fileExists(path.join(cwd, CONFIG_FILE));
    if (configExists && !force) {
      if (!dryRun) {
        const overwrite = await prompt('Config already exists. Overwrite?');
        if (!overwrite) {
          logger('Aborted. Existing config preserved.');
          return 1;
        }
      } else {
        logger('[dry-run] Would prompt for overwrite.');
      }
    }

    for (const dir of REQUIRED_DIRS) {
      const fullPath = path.join(cwd, dir);
      if (!fileExists(fullPath)) {
        if (dryRun) {
          logger(`[dry-run] Would create directory: ${dir}`);
        } else {
          fs.mkdirSync(fullPath, { recursive: true });
          logger(`Created directory: ${dir}`);
        }
      }
    }

    const configPath = path.join(cwd, CONFIG_FILE);
    if (dryRun) {
      logger(`[dry-run] Would write config: ${CONFIG_FILE}`);
    } else {
      fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
      logger(`Wrote config: ${CONFIG_FILE}`);
    }

    logger('Project initialized.');
    return 0;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger(`Error: ${message}`);
    logger('Check permissions or try running with elevated privileges.');
    return 2;
  }
}

export default initProject;
