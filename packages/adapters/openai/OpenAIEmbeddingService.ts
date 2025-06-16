import type { EmbeddingService } from '@ports/EmbeddingService';

export class OpenAIEmbeddingService implements EmbeddingService {
  async embed(text: string): Promise<number[]> {
    console.log(`Placeholder embed for: ${text.substring(0, 50)}...`);
    // Return a dummy embedding
    return Promise.resolve(new Array<number>(1536).fill(0.1)); // Example embedding dimension
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    console.log(`Placeholder embedBatch for ${texts.length} texts.`);
    // Return dummy embeddings
    return Promise.resolve(texts.map((_text) => new Array<number>(1536).fill(0.1)));
  }
}
