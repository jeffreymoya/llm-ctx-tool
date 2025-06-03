import { injectable, inject } from 'tsyringe';
import { VectorStore, CodeProcessor, EmbeddingService } from '@llmctx/ports';

@injectable()
export class IndexCodeUseCase {
  constructor(
    @inject('VectorStore') private vectorStore: VectorStore,
    @inject('CodeProcessor') private codeProcessor: CodeProcessor,
    @inject('EmbeddingService') private embeddingService: EmbeddingService
  ) {}

  async execute(directoryPath: string, options: IndexOptions = {}): Promise<IndexResult> {
    // Implementation
    const files = await this.codeProcessor.discoverFiles(directoryPath);
    const chunks = await this.codeProcessor.extractChunks(files);
    const embeddings = await this.embeddingService.embedBatch(chunks.map(c => c.content));
    
    await this.vectorStore.upsert(chunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i]
    })));

    return {
      filesProcessed: files.length,
      chunksCreated: chunks.length,
      timeElapsed: Date.now()
    };
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