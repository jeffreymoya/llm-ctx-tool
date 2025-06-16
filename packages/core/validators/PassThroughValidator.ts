import type { PipelineStage } from '@ports/IPipeline';
import type { CodeChunk } from '@ports/types';

export class PassThroughValidator implements PipelineStage<CodeChunk, CodeChunk> {
  readonly name = 'pass-through';

  process(input: CodeChunk): Promise<CodeChunk> {
    // Default: just pass through without validation
    return Promise.resolve(input);
  }
}
