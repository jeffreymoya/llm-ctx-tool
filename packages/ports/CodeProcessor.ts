import type { CodeChunk, FileAnalysis } from './types.ts';

export interface CodeProcessor {
  extractChunks(filePath: string): Promise<CodeChunk[]>;
  analyzeFile(filePath: string): Promise<FileAnalysis>;
}
