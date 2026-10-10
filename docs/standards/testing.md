# Testing Standards

- Pyramid: many unit tests, fewer integration tests, few end-to-end tests. Tests are deterministic, isolated, and fast; no sleeping, no shared mutable state, no real network.
- Required per level: Vitest unit; crypto known-answer and cross-platform interop; API integration with Testcontainers Postgres (permissions, migrations); Playwright for web/extension (form zoo); Maestro for mobile.
- Write tests first or alongside the code. Bug fixes start with a failing regression test.
- Coverage targets are a floor, not a goal: `vault-core` and authorization code aim for near-complete branch coverage including failure paths; no merge that lowers coverage in those packages.
- Security tests: authorization (cannot access another user's vault), input validation, rate limiting, token expiry/revocation.
- Test data is seeded fake data. Never use real passwords or real user data in any non-production environment.

The Definition of Ready, Definition of Done, and test-level table are in [../plan.md](../plan.md).
