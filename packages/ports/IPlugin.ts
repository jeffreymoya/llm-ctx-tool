export interface Logger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug?(message: string): void;
}

export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;

  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
}

export interface PluginContext {
  container: unknown; // DI container
  logger: Logger; // Logger instance
  config: unknown; // Configuration
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  main: string;
  dependencies?: Record<string, string>;
  llmctxVersion?: string;
}
