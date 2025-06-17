import { LogLevel } from '../types/common.ts';

export const appConfig = {
  version: '1.0.0',
  logLevel: LogLevel.INFO,
  features: {
    enableCache: true,
    enableMetrics: false,
    maxRetries: 3,
  },
};

export function getFeatureFlag(name: keyof typeof appConfig.features): boolean {
  return appConfig.features[name] as boolean;
}
