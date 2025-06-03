# llmctx Plugins

This directory contains plugins that extend llmctx functionality.

## Plugin Structure

Each plugin should be in its own directory with:
- `package.json` with plugin metadata
- Main entry file (usually `index.js`)
- Optional dependencies

## Example Plugin

See `example-validator/` for a minimal plugin implementation.

## Plugin Interface

Plugins must implement the `IPlugin` interface:

```typescript
interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  
  initialize(context: PluginContext): Promise<void>;
  destroy(): Promise<void>;
}
```

## Loading Plugins

Plugins are automatically loaded from this directory on startup.
Set `ENABLED_PLUGINS` environment variable to control which plugins load. 