# Hearthkey

Zero-knowledge password manager. See [docs/plan.md](docs/plan.md) for the plan and [CLAUDE.md](CLAUDE.md) and [docs/standards/](docs/standards/) for engineering standards.

## Getting started

Requires Node 24 and pnpm 10 (`corepack enable`).

```sh
pnpm install
pnpm check   # format check, lint, type-check and tests
```

Layout: `apps/api` (sync API), `packages/vault-core` (crypto and domain core), `packages/storage` (storage abstractions). Copy `.env.example` to `.env` and fill in values for local runs.

## Running the app (apps/mobile)

Expo (Router) app for iOS, Android and web. Bundle identifier: `net.sgummalla.hearthkey`.

```sh
cp apps/mobile/.env.example apps/mobile/.env   # set EXPO_PUBLIC_API_BASE_URL
pnpm --filter @hearthkey/mobile web            # or: ios, android
```

For staging use `EXPO_PUBLIC_API_BASE_URL=https://hearthkey-staging.fly.dev`. The home screen shows the API status from `/v1/health`.
