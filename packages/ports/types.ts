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
