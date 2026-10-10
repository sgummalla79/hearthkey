# ADR-0001: Staging on Fly.io, production on a VPS

- Status: Accepted
- Date: 2026-10-10
- Deciders: Suman Gummalla

## Context

The plan called for two rented VPSs (staging and production), both built from the same scripted setup so staging rehearses production. The owner already has one VPS (Hostinger, 2 vCPU, 8 GB RAM, 100 GB disk) and wants it used for production. Staging and production must be fully separated: staging runs unreleased code and test tooling, and production holds real encrypted vaults.

## Options considered

| Option | Verdict |
| --- | --- |
| A. Staging on Fly.io, production on the VPS | Chosen |
| B. Second Docker Compose stack on the same VPS | Rejected: shared host, kernel, disk and failure domain |
| C. k3s/Kubernetes on the one VPS for both | Rejected: namespaces are not isolation; roughly 1 GB RAM overhead; heavy to operate alone; does not rehearse a separate production |
| D. Second small VPS for staging | Fallback if Fly.io proves unsuitable |

## Decision

- **Production** runs on the VPS with Docker Compose: API, PostgreSQL, MinIO and Caddy.
- **Staging** runs on Fly.io using the same container images, with a custom `staging.<domain>` hostname (needed for passkeys and app domain association), and holds test accounts only.
- The production deploy path (SSH, `docker compose pull && up`, migrations first) is exercised against the production VPS from Sprint 0 with fake data, until the Phase 4 security gate allows real user data.
- Application code stays provider-neutral: configuration comes from environment variables and storage goes through the `VaultRepository` and `BlobStore` interfaces, so Fly.io Postgres/Tigris and VPS Postgres/MinIO are configuration differences only.

## Consequences

- Positive: real isolation between environments; no second server to pay for or patch; staging TLS and scaling handled by Fly.io.
- Negative: two deploy mechanisms (flyctl and SSH/Compose). Mitigated by deploying to the production VPS early and keeping a smoke suite that runs against both.
- Staging Postgres on Fly.io is not fully managed; backups for staging are optional because it holds only fake data.
- Backups for production must go to a provider other than the VPS host.
- If Fly.io proves unsuitable, option D replaces it without code changes.
