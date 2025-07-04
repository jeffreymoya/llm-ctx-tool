import type { CodeChunk, SearchResult, FileAnalysis } from './types.ts';

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

export * from './CodeProcessor.ts';
export * from './EmbeddingService.ts';
export * from './IPipeline.ts';
export type { IPlugin, PluginContext, PluginManifest } from './IPlugin.ts';
export type { Logger, LogMetadata } from './Logger.ts';
export * from './types.ts';
export * from './VectorStore.ts';
