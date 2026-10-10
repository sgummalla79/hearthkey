# Hearthkey

Zero-knowledge password manager. See [docs/plan.md](docs/plan.md) for the plan and [CLAUDE.md](CLAUDE.md) and [docs/standards/](docs/standards/) for engineering standards.

## Getting started

Requires Node 24 and pnpm 10 (`corepack enable`).

```sh
pnpm install
pnpm check   # format check, lint, type-check and tests
```

Layout: `apps/api` (sync API), `packages/vault-core` (crypto and domain core), `packages/storage` (storage abstractions). Copy `.env.example` to `.env` and fill in values for local runs.
