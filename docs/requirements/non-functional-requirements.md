# Non-Functional Requirements

Status: draft for sign-off. All numeric targets are initial values and must live in configuration or monitoring, not in code (see [../standards/architecture.md](../standards/architecture.md)). Detailed rules are in [../standards/](../standards/).

| Area | Requirement | Verification |
| --- | --- | --- |
| Security | Zero-knowledge: server stores only ciphertext, wrapped keys, public keys, auth-key hash. Meets OWASP ASVS L2 and MASVS L2 | Crypto spec review, ASVS/MASVS checklist each release, independent review at Sprint 8 |
| Cryptography | libsodium only (Argon2id, XChaCha20-Poly1305, X25519, HKDF); versioned formats; cross-platform interop | Known-answer vectors and interop tests on every PR |
| Privacy | Minimum data collected; no secrets, URLs or item titles in logs or crash reports; account deletion removes all server data | Log-scrub tests, privacy policy |
| Availability | Target 99.5% monthly API availability at MVP; vault readable offline | Uptime monitor, SLO alerts |
| Performance | Unlock, search and fill feel instant: target p95 < 300 ms for local operations after unlock; API p95 < 500 ms for sync calls; Argon2id tuned on slowest supported phone | Benchmarks in CI, monitoring |
| Scalability | Single VPS must handle the expected MVP user count; stateless API so it can scale out; storage swappable by config | Load test before launch |
| Reliability | Nightly backups at a different provider; restore tested before each sprint release; rollback with one command | Restore drill, deploy runbook |
| Data integrity | Sync uses optimistic concurrency; conflicts are detected (409) and resolved without data loss | Integration tests for conflict cases |
| Compatibility | Latest two major versions of Chrome; iOS and Android versions per store policy; modern evergreen browsers for web | Playwright, Maestro matrices |
| Accessibility | WCAG 2.2 AA on all clients; keyboard and screen-reader support | Accessibility pass in Sprint 8 |
| Usability | Plain-language warnings for irreversible actions; onboarding makes recovery kit unmissable | Acceptance review |
| Maintainability | SOLID, strict TypeScript, lint and format gates, layered architecture | CI gates |
| Testability | Unit, integration, e2e, crypto interop, form-zoo suites | CI, nightly runs |
| Observability | Structured logs with correlation ids, health endpoints, scrubbed error tracking, uptime and disk alerts | Monitoring review |
| Portability | Standard containers; Postgres dump/restore and S3 mirror to move providers | Migration rehearsal |
| Compliance | Store policies (App Store, Play, Chrome Web Store); privacy policy; dependency licences reviewed | Store review, licence check |
| Supply chain | Lockfile, Renovate, CodeQL, secret scanning, image scanning; SLSA provenance target | CI gates |
