# ADR-0001: Adopt Hexagonal Architecture

Date: 2024-01-15
Status: Accepted
Deciders: Development Team

## Context

The llmctx codebase needs a clear architectural pattern that supports:
- Testability with mock/stub external dependencies
- Swappable components (vector stores, embedding services)
- Clear separation of business logic from infrastructure
- Plugin system extensibility

## Decision

Adopt Hexagonal Architecture (Ports & Adapters) with these layers:

- **Core**: Pure business logic, no external dependencies
- **Ports**: Interfaces defining contracts between layers
- **App**: Use case orchestration, depends on core and ports
- **Adapters**: External integrations, implement ports
- **CLI**: User interface, depends on app layer

Enforce boundaries using dependency-cruiser and TypeScript path mapping.

## Consequences

### Positive
- Clear dependency flow (inward-only)
- Easy to test with in-memory implementations
- Swappable adapters without core changes
- Plugin system can extend without modification

### Negative
- Initial complexity higher than simple layered architecture
- More interfaces and indirection
- Learning curve for contributors

## Alternatives Considered

1. **Simple Layered Architecture**: Rejected due to coupling issues
2. **Clean Architecture**: Too complex for current needs
3. **Microservices**: Overkill for single-developer tool 