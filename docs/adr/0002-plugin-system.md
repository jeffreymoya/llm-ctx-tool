# ADR-0002: Plugin System Design

Date: 2024-01-15
Status: Accepted
Deciders: Development Team

## Context

llmctx needs extensibility for:
- Custom validators (security, style, complexity)
- Additional embedding models
- New retrieval strategies
- Integration with external tools

## Decision

Implement a plugin system with:

1. **Directory-based discovery**: Plugins in `plugins/` folder
2. **Interface-based contracts**: Plugins implement `IPlugin`
3. **Dependency injection integration**: Plugins can register services
4. **Runtime loading**: Plugins loaded at startup
5. **Environment control**: `ENABLED_PLUGINS` controls loading

## Consequences

### Positive
- Extensible without core modifications
- Third-party contributions possible
- Custom organizational needs supported
- Clear plugin boundaries

### Negative
- Security considerations for untrusted plugins
- Version compatibility management
- Additional testing complexity

## Alternatives Considered

1. **Configuration-only extensions**: Too limited
2. **Git submodules**: Complex dependency management
3. **NPM packages**: Too heavyweight for simple extensions 