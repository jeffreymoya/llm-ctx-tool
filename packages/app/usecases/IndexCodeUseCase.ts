import { inject, injectable } from 'tsyringe';
import { VectorStore, CodeProcessor } from '@ports';

@injectable()
export class IndexCodeUseCase {
  constructor(
    @inject('VectorStore') private vectorStore: VectorStore,
    @inject('CodeProcessor') private codeProcessor: CodeProcessor
  ) {}

  async execute(directoryPath: string): Promise<void> {
    // Extract logic from scripts/index-code.ts
    // Orchestrate core services and adapters
  }
} 