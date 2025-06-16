import type { PipelineStage } from '@ports/IPipeline';

export class PipelineBuilder<T> {
  private readonly stages: PipelineStage<unknown, unknown>[] = [];

  use<TNext>(stage: PipelineStage<T, TNext>): PipelineBuilder<TNext> {
    this.stages.push(stage as PipelineStage<unknown, unknown>);
    return this as unknown as PipelineBuilder<TNext>;
  }

  async execute(input: T): Promise<unknown> {
    let current: unknown = input;

    for (const stage of this.stages) {
      current = await stage.process(current);
    }

    return current;
  }

  getStages(): string[] {
    return this.stages.map((s) => s.name);
  }
}
