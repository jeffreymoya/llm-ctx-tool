# llmctx • Project Guidelines

> **Keep it clean, small, and swappable.** Follow these rules to ensure flexibility, reusability, and easy growth.

---

## 1  Folder Layout (📁 single‑source‑of‑truth)

```
packages/
  core/          # domain‑only, no deps
  ports/         # TypeScript interfaces
  app/           # use‑case orchestration
  adapters/      # one folder per concrete impl
  cli/           # commander program & cmds
plugins/         # third‑party add‑ons (auto‑loaded)
```

*Each folder exports a single `index.ts` barrel.*

---

## 2  Layer Rules (Hexagonal)

| Layer              | May depend on          |  Must **NOT** depend on         |
| ------------------ | ---------------------- | ------------------------------- |
| **core**           | –                      | anything outside `core`/`ports` |
| **app**            | `core`, `ports`        | `adapters`, external libs       |
| **adapters**       | `ports`, external libs | `core`                          |
| **cli / delivery** | `app`                  | `core`, `adapters` internals    |

> Violations blocked in CI by **dependency‑cruiser**.

---

## 3  Dependency Injection

* **Container**: `tsyringe` (single `container` instance)
* **Composition root**: `packages/cli/index.ts` only.
* Register adapters in `adapters/index.ts`:

```ts
container.register<VectorStore>("VectorStore", { useClass: QdrantVectorStore });
```

* Swap implementations via env or plugin without touching `core/app`.

---

## 4  Configuration (🍃 .env‑first)

| Key             | Purpose                  | Example  |
| --------------- | ------------------------ | -------- |
| `EMBED_MODEL`   | openai \| minilm         | `minilm` |
| `INDEX_VERSION` | qdrant collection suffix | `v3`     |
| `LOG_LEVEL`     | pino level               | `debug`  |

All parsing & validation in `config/env.ts` (uses `zod`).

---

## 5  CLI Conventions

* Commander as façade. Root command: `llmctx`.
* Sub‑commands mirror use‑cases:

  * `llmctx index [--changed-only]`
  * `llmctx query <text> [--filter k=v]`
  * `llmctx ast-info <file> <line> <char>`
* Return **JSON only** when `--json` flag is present.
* **All CLI commands must be implemented as modular, reusable functions in `packages/cli/commands/`.**
* **Each CLI command must have colocated unit tests in `packages/cli/__tests__` covering expected, edge, and failure cases.**
* **All CLI commands must support robust error handling and a `--dry-run` mode for destructive operations.**

---

## 6  Testing Strategy (Vitest)

| Scope    | Approach                                 |
| -------- | ---------------------------------------- |
| Core/App | unit tests, in‑memory stubs              |
| Adapters | integration with Docker `testcontainers` |
| CLI      | e2e, snapshot stdout                     |

Coverage threshold ≥ 80 % (CI gate).

---

## 7  Personal Dev Checklist 🛠️

* [ ] Keep files in the correct layer & folder.
* [ ] Register any new adapter in `adapters/index.ts`.
* [ ] Run `pnpm lint && pnpm test` locally before each commit.
* [ ] Record significant architectural choices in `docs/adr/`.

---

## 8  Guardrails (Solo Notes)

Even as a solo developer, treat the project as if a team will inherit it:

* Respect layer boundaries—`dependency-cruiser` flags violations.
* Reflect every new env var in `.env.example`.
* Add meaningful context fields to `pino` logs for easier debugging.

---

## 9  Upgrade Paths (📈 future‑proof)  Upgrade Paths (📈 future‑proof)

| Need                     | Drop‑in Upgrade |
| ------------------------ | --------------- |
| scoped DI / interceptors | **Inversify**   |
| CLI plugin marketplace   | **oclif**       |
| monorepo task graph      | **Nx**          |

Swaps require **zero** changes in `core` or `app`.

---

## 10  Extending Extraction & Querying

### 10.1  Data‑Extraction Pipeline

* **Pipeline contract**: every stage implements `PipelineStage<Input, Output>` in `core/pipeline/`.
* **Add / change validation**

  1. Create a pure validator stage in `core/validators/` (or `adapters/validators/` if it needs external libs).
  2. Register it via `PipelineBuilder.use(new MyValidator())` within `app/indexCode` **only**.
  3. Make it togglable with an ENV flag (e.g., `VALIDATORS=email,regex`).
* Validators either enrich chunk metadata or throw a typed `ValidationError`—no side effects.

### 10.2  Query‑Side Extensions

* Retrieval flows through the `IRetriever` **port**.
* **New feature steps** (rerank, semantic filters, summarisation) should be decorators that wrap the base retriever:

  ```ts
  export class RerankRetriever implements IRetriever {
    constructor(private base: IRetriever) {}
    async search(q: Query): Promise<Result[]> { … }
  }
  ```
* Bind the decorator via DI (`container.register<IRetriever>("IRetriever", { useClass: RerankRetriever })`).
* Expose strategies through CLI flag `--strategy` or ENV `RETRIEVER=r2`.

> **Outcome:** you can add, remove, or reorder validations and query behaviours without touching core entities or CLI parsing — only pipeline wiring changes.

### Remember

> **Pure core, thin edges, swap at the ports.**

Stick to this document and *llmctx* stays nimble today, durable tomorrow.
