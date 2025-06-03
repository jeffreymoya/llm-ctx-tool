import { IPlugin, PluginContext, PluginManifest } from '@llmctx/ports/IPlugin';
import * as fs from 'fs/promises';
import * as path from 'path';

export class PluginManager {
  private plugins = new Map<string, IPlugin>();
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  async loadPlugins(pluginsDir: string): Promise<void> {
    try {
      const entries = await fs.readdir(pluginsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.loadPlugin(path.join(pluginsDir, entry.name));
        }
      }
    } catch (error) {
      // Plugins directory doesn't exist - that's ok
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private async loadPlugin(pluginPath: string): Promise<void> {
    const manifestPath = path.join(pluginPath, 'package.json');

    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest: PluginManifest = JSON.parse(manifestContent);

      const mainPath = path.join(pluginPath, manifest.main || 'index.js');
      const pluginModule = await import(mainPath);

      const plugin: IPlugin = new pluginModule.default();

      await plugin.initialize(this.context);
      this.plugins.set(manifest.name, plugin);

      console.log(`Loaded plugin: ${manifest.name}@${manifest.version}`);
    } catch (error) {
      console.warn(`Failed to load plugin at ${pluginPath}:`, error);
    }
  }

  async unloadAll(): Promise<void> {
    for (const plugin of this.plugins.values()) {
      try {
        await plugin.destroy();
      } catch (error) {
        console.warn(`Error destroying plugin ${plugin.name}:`, error);
      }
    }
    this.plugins.clear();
  }

  getLoadedPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }
}
