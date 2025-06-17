export interface DataProcessor {
  process(data: unknown): unknown;
}

export class SimpleProcessor implements DataProcessor {
  process(data: unknown): unknown {
    return { processed: data };
  }
}
