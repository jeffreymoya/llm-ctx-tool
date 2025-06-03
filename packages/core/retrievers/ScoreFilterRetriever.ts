import { IRetriever, SearchResult, Query } from '@llmctx/ports';

export class ScoreFilterRetriever implements IRetriever {
  constructor(
    private baseRetriever: IRetriever,
    private minScore: number = 0.5
  ) {}

  async search(query: Query): Promise<SearchResult[]> {
    const results = await this.baseRetriever.search(query);
    
    return results.filter(result => result.score >= this.minScore);
  }
} 