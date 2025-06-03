import 'reflect-metadata';
import { Command } from 'commander';

import { container } from '@config/container.ts';
import { getEnv } from '@config/env.ts';
import { PluginManager } from '@core/plugins/PluginManager.ts';
import { SearchResult } from '@ports/index.ts';

// Import to register adapters
import '@adapters/index.ts';

const program = new Command();
const env = getEnv();

async function setupPlugins(): Promise<PluginManager> {
  const pluginManager = new PluginManager({
    container,
    logger: console, // TODO: Replace with proper logger
    config: env,
  });

  await pluginManager.loadPlugins(env.PLUGINS_DIR);
  return pluginManager;
}

program
  .name('llmctx')
  .description('Code intelligence tool with semantic search and AI capabilities')
  .version('0.3.0')
  .option('-v, --verbose', 'verbose output')
  .option('--json', 'output as JSON')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.verbose) {
      process.env.LOG_LEVEL = 'debug';
    }
  });

program
  .command('index')
  .alias('ingest')
  .description('Index code files for semantic search')
  .argument('[directory]', 'directory to index', process.cwd())
  .option('--changed-only', 'only index changed files')
  .option('--include-tests', 'include test files')
  .action(async (directory: string, options: { changedOnly?: boolean; includeTests?: boolean }) => {
    const { IndexCodeUseCase } = await import('@app/usecases/IndexCodeUseCase');
    const useCase = container.resolve<InstanceType<typeof IndexCodeUseCase>>(IndexCodeUseCase);
    const result = await useCase.execute(directory, {
      changedOnly: options.changedOnly ?? false,
      includeTests: options.includeTests ?? false,
    });

    if (program.opts().json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`✅ Indexed ${result.filesProcessed} files, created ${result.chunksCreated} chunks`);
    }
  });

program
  .command('query')
  .description('Query indexed code')
  .argument('<text>', 'query text')
  .option('-l, --limit <number>', 'maximum results', '10')
  .option('--filter <key=value>', 'filter by metadata', [])
  .option('--min-score <number>', 'minimum similarity score', '0.5')
  .action(async (text: string, _options: { limit: string; filter: string[]; minScore: string }) => {
    const { QueryCodeUseCase } = await import('@app/usecases/QueryCodeUseCase');
    const useCase = container.resolve<InstanceType<typeof QueryCodeUseCase>>(QueryCodeUseCase);
    const results = await useCase.execute(text);

    if (program.opts().json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      results.forEach((result: SearchResult, i: number) => {
        console.log(`\n${i + 1}. ${result.chunk.filePath}:${result.chunk.startLine}`);
        console.log(`   Score: ${result.score.toFixed(3)}`);
        console.log(`   ${result.chunk.content.slice(0, 100)}...`);
      });
    }
  });

program
  .command('plugins')
  .description('List loaded plugins')
  .action(async () => {
    const pluginManager = await setupPlugins();
    const plugins = pluginManager.getLoadedPlugins();

    if (program.opts().json) {
      console.log(JSON.stringify({ plugins }, null, 2));
    } else {
      console.log(`Loaded plugins: ${plugins.join(', ') || 'none'}`);
    }
  });

// Error handling
program.exitOverride();

try {
  await setupPlugins();
  await program.parseAsync();
} catch (error) {
  const err = error instanceof Error ? error : new Error(String(error));
  if (program.opts().json) {
    console.error(JSON.stringify({ error: err.message }, null, 2));
  } else {
    console.error('❌ Error:', err.message);
  }
  process.exit(1);
}
