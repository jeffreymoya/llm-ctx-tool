export interface Config {
  apiKey: string;
  timeout: number;
}

export enum Status {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export const defaultConfig: Config = {
  apiKey: 'default',
  timeout: 5000,
};

function internalHelper(data: unknown): unknown {
  return data;
}

export { internalHelper as helper };
