# llm-ctx-tool Technical Documentation

## Overview

llm-ctx-tool is a modular, extensible Retrieval-Augmented Generation (RAG) pipeline for codebase indexing and semantic search, built with a strict Hexagonal Architecture (Ports & Adapters). It supports Google Gemini embeddings, Qdrant vector storage, and a plugin system for custom extensions.

---

## Architecture

### Hexagonal (Ports & Adapters)
- **Core**: Pure business logic, no external dependencies
- **Ports**: TypeScript interfaces for all external interactions
- **App**: Orchestrates use-cases, depends on core/ports
- **Adapters**: Integrations (e.g., Qdrant, OpenAI, TypeScript parser)
- **CLI**: User interface, depends on app
- **Plugins**: Auto-discovered, loaded at runtime

See [ADR-0001: Hexagonal Architecture](./adr/0001-hexagonal-architecture.md).

### Folder Structure
```
packages/
  core/      # domain logic
  ports/     # interfaces
  app/       # use-cases
  adapters/  # integrations
  cli/       # CLI program
plugins/     # third-party add-ons
```

---

## Core Concepts

### Indexing Pipeline
- Loads `.ts`/`.js` files recursively
- Splits code into chunks (configurable size/overlap)
- Embeds chunks using Google Gemini (or other models via adapters)
- Stores vectors in Qdrant
- Metadata and structure validated by Zod schemas

### Querying
- Accepts natural language/code queries
- Embeds query, searches Qdrant for similar chunks
- Returns ranked, metadata-rich results

### Codebase Parsing
- `CodebaseParser` walks the codebase, extracts AST, definitions, imports/exports, and validates structure
- Results validated by `CodebaseSchemaValidator` (see `core/validators/`)

---

## Extensibility

### Ports & Adapters
- All external dependencies are abstracted via interfaces in `ports/`
- Adapters implement these interfaces and are registered via DI (`tsyringe`)
- Swap adapters by changing registration in `adapters/index.ts`

### Plugin System
- Plugins reside in `plugins/` and implement the `IPlugin` interface
- Loaded at runtime; controlled by `ENABLED_PLUGINS` env var
- Can register new services, validators, or pipeline stages
- See [ADR-0002: Plugin System](./adr/0002-plugin-system.md) and [plugins/README.md](../plugins/README.md)

### Codebase Parsing
- **`CodebaseParser`**: The parser was refactored to use the **TypeScript Compiler API** directly, replacing a fragile regex-based approach. It now generates a full, accurate Abstract Syntax Tree (AST) for each file.
- **Rich Diagnostics**: It captures and returns compiler diagnostics (syntax and semantic errors), providing detailed feedback on malformed code.
- **`CodebaseSchemaValidator`**: The parser's output is validated against a strict, versioned Zod schema (`core/validators/CodebaseSchemaValidator.ts`). This contract-first approach ensures type safety and predictable data structures for consumers of the parsed data.

---

## Configuration
- All config via `.env` and validated in `config/env.ts` (uses `zod`)
- Key variables: `GOOGLE_API_KEY`, `QDRANT_URL`, `SOURCE_DIR`, `CHUNK_SIZE`, etc.
- See root README for full list

---

## Testing & Reliability
- **Unit tests** for all core/app logic (see `core/__tests__`, `app/__tests__`)
- **Integration tests** for adapters (with Docker testcontainers)
- **CLI e2e tests** in `cli/__tests__`
- Coverage threshold ≥ 80%
- All new features require: expected, edge, and failure case tests

---

## Extension Points
- **Validators**: Add to `core/validators/` or as plugins; register in pipeline
- **Retrievers**: Implement `IRetriever` port; decorate for new query strategies
- **Adapters**: Implement port, register in `adapters/index.ts`
- **Plugins**: Place in `plugins/`, implement `IPlugin`

---

## Coding Guidelines
- See [guidelines.md](../guidelines.md) for non-negotiable conventions
- Layer boundaries enforced by dependency-cruiser
- All new env vars must be reflected in `.env.example`
- Defensive coding and logging required

---

## Example: Adding a Custom Validator
1. Create a new validator in `core/validators/` or as a plugin
2. Register it in the pipeline via `PipelineBuilder.use(new MyValidator())`
3. Make it togglable with an ENV flag
4. Add unit tests for all cases

---

## References
- [guidelines.md](../guidelines.md)
- [ADR-0001: Hexagonal Architecture](./adr/0001-hexagonal-architecture.md)
- [ADR-0002: Plugin System](./adr/0002-plugin-system.md)
- [plugins/README.md](../plugins/README.md)

---

For user-facing instructions, see the root [README.md](../README.md). 