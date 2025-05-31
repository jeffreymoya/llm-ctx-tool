import { inject, injectable } from 'tsyringe';
import { VectorStore } from '../../ports';
import { CodeChunk } from '../../core';

@injectable()
export class QueryCodeUseCase {
  constructor(
    @inject('VectorStore') private vectorStore: VectorStore
  ) {}

  async execute(queryText: string): Promise<CodeChunk[]> {
    // Extract logic from scripts/query-snippets.ts
    // Orchestrate core services and adapters
    return []; // Placeholder
  }
} 