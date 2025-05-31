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

// Basic types
export interface CodeChunk {
  id: string;
  content: string;
  filePath: string;
  startLine: number;
  endLine: number;
  metadata: Record<string, any>;
}

export interface SearchResult {
  chunk: CodeChunk;
  score: number;
}

export interface FileAnalysis {
  exports: string[];
  imports: string[];
  functions: string[];
  classes: string[];
}

export * from './VectorStore';
export * from './CodeProcessor';
export * from './EmbeddingService';
export * from './types';
