#!/usr/bin/env node
import 'reflect-metadata';
import { Command } from 'commander';

import { container } from '@config/container';
import { getEnv } from '@config/env';
import { PluginManager } from '@core/plugins/PluginManager';

// Import to register adapters
import '@adapters';

const program = new Command();
const env = getEnv();

interface IndexOptions {
  changedOnly?: boolean;
  includeTests?: boolean;
  dryRun?: boolean;
}

interface QueryOptions {
  limit: string;
  minScore: string;
  filter: string[];
}

interface GlobalOptions {
  verbose?: boolean;
  json?: boolean;
}

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
    const opts = thisCommand.opts<GlobalOptions>();
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
  .option('--dry-run', 'show what would be indexed without doing it')
  .action(async (directory: string, options: IndexOptions) => {
    const { IndexCodeUseCase } = await import('@app/index.ts');
    const useCase = container.resolve(IndexCodeUseCase);

    const result = await useCase.execute(directory, options);

    if (program.opts<GlobalOptions>().json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(
        `✅ Indexed ${result.filesProcessed} files, created ${result.chunksCreated} chunks`,
      );
    }
  });

program
  .command('query')
  .description('Query indexed code')
  .argument('<text>', 'query text')
  .option('-l, --limit <number>', 'maximum results', '10')
  .option('--filter <key=value>', 'filter by metadata', [])
  .option('--min-score <number>', 'minimum similarity score', '0.5')
  .action(async (text: string, options: QueryOptions) => {
    const { QueryCodeUseCase } = await import('@app/index.ts');
    const useCase = container.resolve(QueryCodeUseCase);

    const results = await useCase.execute(text, {
      limit: parseInt(options.limit, 10),
      filters: options.filter,
      minScore: parseFloat(options.minScore),
    });

    if (program.opts<GlobalOptions>().json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      results.forEach((result, i) => {
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

    if (program.opts<GlobalOptions>().json) {
      console.log(JSON.stringify({ plugins }, null, 2));
    } else {
      console.log(`Loaded plugins: ${plugins.join(', ') || 'none'}`);
    }
  });

program
  .command('init')
  .description('Initialize llmctx project config and folder structure')
  .option('--dry-run', 'show what would be created without doing it')
  .option('--force', 'overwrite existing config without prompt')
  .action(async (options: { dryRun?: boolean; force?: boolean }) => {
    const { initProject } = await import('./commands/init.ts');
    const initOptions = {
      ...(options.dryRun !== undefined && { dryRun: options.dryRun }),
      ...(options.force !== undefined && { force: options.force }),
    };
    const code = await initProject(initOptions);
    process.exit(code);
  });

program
  .command('parse')
  .description('Parse project files for analysis')
  .option('--dry-run', 'show what would be parsed without doing it')
  .action(async (options: { dryRun?: boolean }) => {
    const { parseProject } = await import('./commands/parse.ts');
    const parseOptions = {
      ...(options.dryRun !== undefined && { dryRun: options.dryRun }),
    };
    const code = parseProject(parseOptions);
    process.exit(code);
  });

program
  .command('embed')
  .description('Generate embeddings for parsed code')
  .option('--dry-run', 'show what would be embedded without doing it')
  .action(async (options: { dryRun?: boolean }) => {
    const { embedProject } = await import('./commands/embed.ts');
    const embedOptions = {
      ...(options.dryRun !== undefined && { dryRun: options.dryRun }),
    };
    const code = embedProject(embedOptions);
    process.exit(code);
  });

// Error handling
program.exitOverride();

try {
  await setupPlugins();
  await program.parseAsync();
} catch (error) {
  const message = error instanceof Error ? error.message : 'An unknown error occurred';
  const opts = program.opts<GlobalOptions>();
  if (opts.json) {
    console.error(JSON.stringify({ error: message }, null, 2));
  } else {
    console.error('❌ Error:', message);
  }
  process.exit(1);
}
