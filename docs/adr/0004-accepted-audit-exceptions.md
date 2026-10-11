# ADR-0004: Time-boxed dependency audit exceptions (Expo tooling)

- Status: Accepted, review by 2026-11-10
- Date: 2026-10-11
- Deciders: Suman Gummalla

## Context

CI runs `pnpm audit --audit-level high` and the standards forbid merging new high findings. Adding the Expo app introduced two high-severity advisories in transitive dependencies of Expo's developer tooling:

| Advisory | Package | Path | Patched version |
| --- | --- | --- | --- |
| GHSA-86w9-cpqp-85rv (RSA PKCS#1 v1.5 signature verification) | `node-forge` | `expo > @expo/cli` | None; latest release (1.4.0) is affected |
| GHSA-vfj7-8cjw-p6xm (stack exhaustion with deeply nested patterns) | `braces` | `expo > @expo/metro > metro-file-map > micromatch` | None; latest release (3.0.3) is affected |

Neither can be fixed by upgrading or overriding because no patched version exists.

## Decision

Ignore exactly these two advisories through `pnpm.auditConfig.ignoreGhsas` in the root `package.json`. Any other high or critical finding still fails CI.

Rationale for accepting the risk:
- Both packages run only inside Expo's CLI and Metro bundler on developer machines and CI during builds.
- They are not part of the shipped app bundle, the Chrome extension or the API image (the API image installs only its own dependencies).
- No vault data, keys or secrets pass through them.

## Consequences

- The exception expires on **2026-11-10**: re-run `pnpm audit` without the ignores on that date, or earlier when Renovate updates Expo. Remove each ignore as soon as a patched version exists, and delete this ADR's entries.
- If either package ever becomes reachable from shipped code, this exception no longer applies and must be revisited immediately.
