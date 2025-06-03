export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;

  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
}

export interface PluginContext {
  container: unknown; // DI container
  logger: unknown; // Logger instance
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
