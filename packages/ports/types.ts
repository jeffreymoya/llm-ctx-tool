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

export interface Query {
  text: string;
  filters?: Record<string, string | number | boolean>;
  limit?: number;
  minScore?: number;
}

export interface IRetriever {
  search(query: Query): Promise<SearchResult[]>;
  retrieve(query: Query, results: SearchResult[]): Promise<SearchResult[]>;
}

export interface FileAnalysis {
  exports: string[];
  imports: string[];
  functions: string[];
  classes: string[];
}
