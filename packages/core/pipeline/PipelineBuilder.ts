import { PipelineStage } from '@llmctx/ports/IPipeline';

export class PipelineBuilder<T> {
  private stages: PipelineStage<any, any>[] = [];

  use<TNext>(stage: PipelineStage<T, TNext>): PipelineBuilder<TNext> {
    this.stages.push(stage);
    return this as any;
  }

  async execute(input: T): Promise<any> {
    let current = input;
    
    for (const stage of this.stages) {
      current = await stage.process(current);
    }
    
    return current;
  }

  getStages(): string[] {
    return this.stages.map(s => s.name);
  }
} 