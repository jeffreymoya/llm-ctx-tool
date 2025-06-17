import pino from 'pino';
import type { Level, Logger as PinoLoggerInstance } from 'pino';
import { injectable, singleton } from 'tsyringe';

import { env } from '../../config/index.ts';
import type { Logger, LogMetadata } from '../../ports/index.ts';

@singleton()
@injectable()
export class PinoLogger implements Logger {
  private logger: PinoLoggerInstance;

  constructor() {
    // Type guard for env.LOG_LEVEL
    const logLevel = this.getLogLevel(env);

    this.logger = pino({
      level: logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      },
    });
  }

  private getLogLevel(envObj: unknown): Level {
    if (!envObj || typeof envObj !== 'object') {
      return 'info';
    }

    const envRecord = envObj as Record<string, unknown>;
    const logLevel = envRecord.LOG_LEVEL;

    if (typeof logLevel === 'string' && ['error', 'warn', 'info', 'debug'].includes(logLevel)) {
      return logLevel as Level;
    }

    return 'info';
  }

  debug(message: string, metadata?: LogMetadata): void {
    this.logger.debug(metadata, message);
  }

  info(message: string, metadata?: LogMetadata): void {
    this.logger.info(metadata, message);
  }

  warn(message: string, metadata?: LogMetadata): void {
    this.logger.warn(metadata, message);
  }

  error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.logger.error({ ...metadata, err: error }, message);
  }
}
