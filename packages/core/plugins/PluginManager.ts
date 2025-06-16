import * as fs from 'fs/promises';
import * as path from 'path';

import { injectable } from 'tsyringe';

import type { IPlugin, PluginContext, PluginManifest } from '@ports/IPlugin';

@injectable()
export class PluginManager {
  private readonly plugins: IPlugin[] = [];
  private readonly context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  async loadPlugins(pluginsDir: string): Promise<void> {
    try {
      const pluginNames = await fs.readdir(pluginsDir);

      for (const pluginName of pluginNames) {
        const pluginPath = path.join(pluginsDir, pluginName);
        const manifestPath = path.join(pluginPath, 'package.json');

        try {
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');
          const manifest: PluginManifest = JSON.parse(manifestContent) as PluginManifest;

          // Basic validation (add more as needed)
          if (!manifest.name || !manifest.version || !manifest.main) {
            this.context.logger.warn(`Skipping plugin at ${pluginPath}: Invalid manifest`);
            continue;
          }

          const mainPath = path.join(pluginPath, manifest.main);
          // Use a dynamic import to load the plugin module
          const pluginModule: unknown = await import(mainPath);

          if (
            typeof pluginModule === 'object' &&
            pluginModule !== null &&
            'default' in pluginModule
          ) {
            const PluginClass = (pluginModule as { default: unknown }).default;

            if (typeof PluginClass === 'function') {
              // Instantiate and initialize the plugin using DI container for dependencies if needed
              // For simplicity, we'll pass context directly for now
              const pluginInstance: IPlugin = new (PluginClass as new () => IPlugin)();
              await pluginInstance.initialize(this.context);
              this.plugins.push(pluginInstance);
              this.context.logger.info(`Loaded plugin ${manifest.name}@${manifest.version}`);
            } else {
              this.context.logger.warn(
                `Skipping plugin at ${pluginPath}: Main file does not export a default class`,
              );
            }
          } else {
            this.context.logger.warn(
              `Skipping plugin at ${pluginPath}: Main file does not export a default class`,
            );
          }
        } catch (manifestError: unknown) {
          const errorMessage =
            manifestError instanceof Error ? manifestError.message : String(manifestError);
          this.context.logger.error(
            `Failed to read or parse manifest for plugin at ${pluginPath}: ${errorMessage}`,
          );
        }
      }
    } catch (dirError: unknown) {
      const dirErrorInstance = dirError as Error & { code?: string };
      if (dirErrorInstance.code === 'ENOENT') {
        this.context.logger.info(
          `Plugins directory not found at ${pluginsDir}. No plugins loaded.`,
        );
      } else {
        const errorMessage = dirError instanceof Error ? dirError.message : String(dirError);
        this.context.logger.error(
          `Failed to read plugins directory ${pluginsDir}: ${errorMessage}`,
        );
      }
    }
  }

  getLoadedPlugins(): string[] {
    return this.plugins.map((plugin) => `${plugin.name}@${plugin.version}`);
  }
}
