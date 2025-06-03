export interface PipelineStage<TInput, TOutput> {
  readonly name: string;
  process(input: TInput): Promise<TOutput>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  metadata: Record<string, unknown>;
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  line?: number;
  column?: number;
}
