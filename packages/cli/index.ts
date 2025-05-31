import 'reflect-metadata';
import { container } from 'tsyringe';
import { Command } from 'commander';
import { IndexCodeUseCase, QueryCodeUseCase } from '../app';

// Register dependencies
import '../adapters'; // This will register adapter implementations

const program = new Command();

program.name('llmctx').description('Code intelligence tool').version('0.1.0');

program
  .command('index')
  .description('Index code files')
  .argument('<directory>', 'directory to index')
  .action(async (directory: string) => {
    const useCase = container.resolve(IndexCodeUseCase);
    await useCase.execute(directory);
  });

program
  .command('query')
  .description('Query indexed code')
  .argument('<text>', 'query text')
  .action(async (text: string) => {
    const useCase = container.resolve(QueryCodeUseCase);
    const results = await useCase.execute(text);
    console.log(JSON.stringify(results, null, 2));
  });

program.parse();
