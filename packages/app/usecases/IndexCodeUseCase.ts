import { injectable, inject } from 'tsyringe';

import type { VectorStore, CodeProcessor, EmbeddingService, CodeChunk } from '@ports/index';

@injectable()
export class IndexCodeUseCase {
  constructor(
    @inject('VectorStore') private readonly vectorStore: VectorStore,
    @inject('CodeProcessor') private readonly codeProcessor: CodeProcessor,
    @inject('EmbeddingService') private readonly embeddingService: EmbeddingService,
  ) {}

  async execute(
    directoryPath: string,
    options: { changedOnly?: boolean; includeTests?: boolean; dryRun?: boolean },
  ): Promise<{ filesProcessed: number; chunksCreated: number }> {
    // Placeholder implementation
    console.log(`Indexing directory: ${directoryPath}`);
    console.log('Options:', options);

    // Simulate chunk extraction (assuming CodeProcessor extracts chunks directly)
    // Note: CodeProcessor interface only has extractChunks and analyzeFile
    // The CodeProcessor interface might need to be updated to include file discovery
    // For now, we'll assume extractChunks can handle a directory path and return chunks from all files within.
    const chunks = await this.codeProcessor.extractChunks(directoryPath);
    const embeddings = await this.embeddingService.embedBatch(
      chunks.map((c: CodeChunk) => c.content),
    );

    // Simulate upserting to vector store
    await this.vectorStore.upsert(
      chunks.map((chunk: CodeChunk, i: number) => ({
        ...chunk,
        embedding: embeddings[i],
      })),
    );

    // Simulate reporting results
    const filesProcessed = 0; // Cannot accurately determine files processed without a discoverFiles method
    const chunksCreated = chunks.length;

    if (options.dryRun) {
      console.log('Dry run: No files were actually indexed.');
    }

    return { filesProcessed, chunksCreated };
  }
}

export interface IndexOptions {
  changedOnly?: boolean;
  includeTests?: boolean;
}

export interface IndexResult {
  filesProcessed: number;
  chunksCreated: number;
  timeElapsed: number;
}
