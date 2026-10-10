# Hearthkey

Zero-knowledge password manager. pnpm/Turborepo TypeScript monorepo: Expo app (iOS, Android, web), Manifest V3 Chrome extension (WXT), shared `vault-core` package, Fastify + PostgreSQL (Drizzle) API that stores only ciphertext. Plan: [docs/plan.md](docs/plan.md).

## Working agreements
- Never commit, push, or add `Co-Authored-By` lines unless the user explicitly asks.
- **Never work directly on `main`.** Before changing any file for a feature, bug fix, or chore, create a branch (`<type>/<issue-id>-<short-description>`, e.g. `feat/123-passkey-signup`). If the current branch is `main`, branch first. Changes reach `main` only through a pull request. Details: [docs/standards/delivery-and-operations.md](docs/standards/delivery-and-operations.md).
- If a rule here conflicts with the plan or a request, say so and ask before deviating.
- Security outranks convenience. Security-relevant changes need failure-case tests, not just happy paths.

## Must-follow rules
- **Zero-knowledge:** master password, keys, and decrypted data never leave the device, and never appear in logs, crash reports, or the server. The server stores only ciphertext, wrapped keys, public keys, and the auth-key hash.
- **Crypto:** only libsodium via `vault-core` (Argon2id, XChaCha20-Poly1305, X25519, HKDF). Never write custom crypto or use `Math.random()` for secrets. Never reuse a nonce.
- **No hardcoding:** no literals for URLs, ports, limits, timeouts, KDF parameters, labels, provider names, or flags in logic. Use config (validated with Zod) or a named SCREAMING_SNAKE_CASE constant with a comment explaining why it cannot be externalised.
- **SOLID:** handlers depend on `VaultRepository` and `BlobStore` interfaces, never on Drizzle, MinIO, or the filesystem. Extend with registries and strategies, not `if/else` chains on provider names.
- **TypeScript:** strict mode, no `any`, no `@ts-ignore`, named exports only, typed errors, binary data as `Uint8Array`.
- **API:** nouns, plural resources, `/v1` versioning, correct status codes (never 200 for an error), standard error payload `{ "error": { "code", "message", "details", "requestId" } }`, Zod validation at every boundary, authorization on every request.
- **Tests:** bug fixes start with a failing test; crypto needs known-answer vectors; test data is fake, never real.
- **Logging:** never log secrets, URLs, or item titles.

## Detailed standards (read before working in that area)
- [docs/standards/security.md](docs/standards/security.md): auth, crypto, API hardening, extension/web/mobile security, supply chain. Read before touching auth, crypto, sharing, recovery, or the extension.
- [docs/standards/architecture.md](docs/standards/architecture.md): SOLID, design principles, no-hardcoding detail, TypeScript style.
- [docs/standards/api-and-data.md](docs/standards/api-and-data.md): REST conventions, error payload, migrations, storage.
- [docs/standards/testing.md](docs/standards/testing.md): test levels, coverage, security tests.
- [docs/standards/delivery-and-operations.md](docs/standards/delivery-and-operations.md): git/PR workflow, logging, deploys, accessibility, SLOs and incident postmortems, reference frameworks (Twelve-Factor, SLSA), governance files.
