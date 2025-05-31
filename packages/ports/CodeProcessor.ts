import { CodeChunk, FileAnalysis } from './types';

export interface CodeProcessor {
  extractChunks(filePath: string): Promise<CodeChunk[]>;
  analyzeFile(filePath: string): Promise<FileAnalysis>;
}
