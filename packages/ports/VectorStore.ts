import { CodeChunk, SearchResult } from './types';

export interface VectorStore {
  upsert(chunks: CodeChunk[]): Promise<void>;
  search(query: string, limit?: number): Promise<SearchResult[]>;
  delete(ids: string[]): Promise<void>;
  healthCheck(): Promise<boolean>;
}
