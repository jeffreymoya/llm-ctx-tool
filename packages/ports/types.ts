export interface ChunkMetadata {
  language?: string;
  functionName?: string;
  className?: string;
  complexity?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface CodeChunk {
  id: string;
  content: string;
  filePath: string;
  startLine: number;
  endLine: number;
  metadata: ChunkMetadata;
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
