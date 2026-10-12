# ADR-0005: Staging only until the MVP; development builds for clients

- Status: Accepted
- Date: 2026-10-11
- Deciders: Suman Gummalla

## Context

The plan had production live from Sprint 0 (rehearsed with fake data) and every sprint published to TestFlight, Google Play internal testing and a private Chrome Web Store listing. The owner decided that nothing should be deployed to production until the MVP, and that client apps (iPhone, Android, Mac/iPad, Chrome extension) are only distributed as development builds until then.

## Decision

Until the MVP launch (week of 2027-02-22):
- **API and web:** only staging (Fly.io) is deployed. The production VPS stays unprovisioned; no production deploys, DNS or certificates.
- **Clients:** only development builds on the owner's own devices or simulators (EAS development builds, internal APKs, an unpacked Chrome extension). No TestFlight, Google Play or Chrome Web Store distribution.
- **Release pipeline:** the tag-triggered workflow deploys to staging only, which is how it is built today.

At the MVP: production is provisioned and rehearsed with fake data in Sprint 8, then store submissions go in during Sprint 7 to 8 so approvals land before launch week.

## Consequences

- Positive: lower cost and less operational surface during development; no real users or data to protect early; fewer accounts needed immediately.
- Negative: the production environment and the store review processes are first exercised late, so launch-week risk is higher. Mitigations: rehearse production with fake data in Sprint 8, submit to stores early, and keep the launch checklist in the environments runbook.
- Google Play requires a closed test with a minimum number of testers for new personal accounts before production release, and TestFlight external review and Chrome review take time; these must be started in Sprint 7 at the latest.
- Supersedes the parts of ADR-0001 that rehearse the production deploy from Sprint 0 and the plan's per-sprint beta channels.
- Developer accounts (Apple done; Google Play and Chrome Web Store) are no longer needed before Sprint 7.
