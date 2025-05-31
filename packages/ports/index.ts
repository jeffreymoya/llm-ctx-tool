import { CodeChunk, SearchResult, FileAnalysis } from './types';

// Vector store operations
export interface VectorStore {
  upsert(chunks: CodeChunk[]): Promise<void>;
  search(query: string, limit?: number): Promise<SearchResult[]>;
  delete(ids: string[]): Promise<void>;
  healthCheck(): Promise<boolean>;
}

// Code processing
export interface CodeProcessor {
  extractChunks(filePath: string): Promise<CodeChunk[]>;
  analyzeFile(filePath: string): Promise<FileAnalysis>;
}

// Embedding service
export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export * from './VectorStore';
export * from './CodeProcessor';
export * from './EmbeddingService';
export * from './types';
