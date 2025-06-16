import type { IRetriever, SearchResult, Query } from '@ports/index';

export class ScoreFilterRetriever implements IRetriever {
  constructor(
    private readonly baseRetriever: IRetriever,
    private readonly minScore: number = 0.5,
  ) {}

  async search(query: Query): Promise<SearchResult[]> {
    const results = await this.baseRetriever.search(query);

    return results.filter((result) => result.score >= this.minScore);
  }

  retrieve(query: Query, results: SearchResult[]): Promise<SearchResult[]> {
    return Promise.resolve(results.filter((result: SearchResult) => result.score >= this.minScore));
  }
}
