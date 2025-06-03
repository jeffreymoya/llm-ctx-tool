import { PipelineStage, ValidationResult } from '@llmctx/ports/IPipeline';
import { CodeChunk } from '@llmctx/ports';

export class PassThroughValidator implements PipelineStage<CodeChunk, CodeChunk> {
  readonly name = 'pass-through';

  async process(input: CodeChunk): Promise<CodeChunk> {
    // Default: just pass through without validation
    return input;
  }
} 