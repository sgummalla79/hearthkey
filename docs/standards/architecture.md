# Architecture, Design and Code Style Standards

## 1. SOLID
- **Single Responsibility:** one reason to change per class, module, function, component. Route handlers handle HTTP; repositories data access; stores state; components rendering; `vault-core` crypto/domain only.
- **Open/Closed:** extend by adding code (new item types, providers, strategies), not by editing existing logic. Use registries (item-type registry, BlobStore adapters) instead of growing `if/else` or `switch` chains.
- **Liskov Substitution:** every implementation of an interface is fully substitutable. `BlobStore` (filesystem, S3/MinIO) and `VaultRepository` implementations must behave identically to callers.
- **Interface Segregation:** narrow contracts. Components take only the props they use; functions only the arguments they use.
- **Dependency Inversion:** depend on abstractions and inject dependencies. API handlers depend on `VaultRepository` and `BlobStore` interfaces, never on Drizzle, MinIO, or the filesystem directly. Provider/platform checks by name in logic are a smell; extract a capability or strategy.

## 2. Other principles
- **DRY, but not prematurely:** remove real duplication; wait for the third occurrence before abstracting. Do not obscure business logic.
- **KISS and YAGNI:** build what the current story needs. No speculative generality.
- **Separation of concerns / layering:** domain logic has no dependency on frameworks, I/O, or platform APIs. `vault-core` stays free of platform APIs; platform differences live in adapters.
- **Composition over inheritance.** Prefer pure functions and immutable data; isolate side effects at the edges.
- **Fail fast and fail closed:** validate early, throw typed errors, deny on ambiguity.
- **Least privilege** applies to code too: minimal exports, minimal permissions, minimal scopes.
- **Make illegal states unrepresentable:** use discriminated unions, branded types (e.g. `VaultId`, `ItemId`, `Ciphertext`), and exhaustive `switch` with `never` checks.
- **One source of truth for contracts:** Zod schemas in a shared package generate API types for server and clients. Never hand-duplicate types.

## 3. No hardcoding

Hardcoded values are prohibited in application logic, components, routes, strategies, stores, and utilities. This includes model/provider names, endpoints, URLs, ports, size limits, allowed extensions, timeouts, retry counts, pagination limits, rate limits, KDF parameters, auto-lock durations, UI copy that varies by configuration, and feature flags as string comparisons.

Before writing a literal, ask: "Can this change without a redeploy?" If yes, source it from the database or environment config (validated at startup with Zod; fail fast if missing).

True exceptions (mathematical constants, library-required literals) go in a dedicated constants file, named in SCREAMING_SNAKE_CASE, with a comment on why they cannot be externalised, and are referenced by name, never inlined.

Security-critical defaults (KDF parameters, token lifetimes) live in versioned config, not scattered literals, and tests assert minimum safe values.

## 4. TypeScript and code style
- `strict: true` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`. No `any`; use `unknown` and narrow. No `@ts-ignore`; `@ts-expect-error` only with a reason comment. No non-null assertions (`!`) outside tests.
- ESLint (typescript-eslint strict, security plugin, import/boundaries rules enforcing the layering above) and Prettier run in CI and pre-commit. Zero warnings policy.
- Named exports only (no default exports); one concept per file; small functions (aim < 40 lines, low cyclomatic complexity); early returns over deep nesting.
- Names express intent: no abbreviations, no `util`/`helper`/`manager` dumping grounds. Booleans read as questions (`isLocked`, `hasPasskey`).
- Errors: throw typed error classes (or return `Result` types in `vault-core`); never swallow errors; never throw strings. Map errors to HTTP responses in one central place.
- Async: always `await` or return promises; no floating promises (lint-enforced); set timeouts and cancellation on network calls.
- Comments explain *why*, not *what*. Keep public APIs documented with TSDoc.
- Binary data uses `Uint8Array`, not strings; never convert key material to strings.
- Dependencies point inward: apps → packages; packages never import from apps; no circular imports.
