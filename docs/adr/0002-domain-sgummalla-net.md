# ADR-0002: Domain is sgummalla.net

- Status: Accepted
- Date: 2026-10-10
- Deciders: Suman Gummalla

## Context

Passkeys (WebAuthn) are bound to a relying party ID derived from the domain, and the iOS associated domains and Android Digital Asset Links are tied to it as well. Changing the domain after launch invalidates every user's passkey and requires new app releases. A dedicated product domain (for example a Hearthkey-branded one) was recommended; the owner chose `sgummalla.net`, registered and managed at GoDaddy.

## Decision

- Primary domain: `sgummalla.net` (DNS at GoDaddy).
- Hostnames:
  - `app.sgummalla.net`: production web app
  - `api.sgummalla.net`: production API (VPS)
  - `staging.sgummalla.net`: staging web app (Fly.io)
  - `staging-api.sgummalla.net`: staging API (Fly.io)
- The WebAuthn relying party ID and app-link domains are read from configuration (never hardcoded), so a later move to a product domain is a configuration change plus a passkey re-enrolment, not a code change.
- GoDaddy account protected with two-factor authentication; enable DNSSEC and registrar lock if offered.

## Consequences

- Positive: domain already owned; no extra cost or delay.
- Negative: a personal domain is less product-branded for store listings, the privacy policy and support email. A later migration would require users to re-enrol passkeys and new app releases.
- Revisit before the Sprint 8 launch readiness work (E10); a move is cheapest before real users exist.
