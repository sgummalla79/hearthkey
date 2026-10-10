# MVP Scope

Status: draft for sign-off (exit gate of Phase 1). Source: [../plan.md](../plan.md).

The MVP is epics **E0 to E4 plus E10**, delivered in Sprint 0 and Sprints 1 to 8, in production the week of 2027-02-22.

## In scope

| Epic | Capability |
| --- | --- |
| E0 Foundation | Monorepo, CI/CD, all environments (including production), developer accounts, crypto spec, threat model, design system, walking skeleton |
| E1 Accounts and keys | Sign up, master password strength meter, key derivation, log in, passkey second factor with TOTP and recovery-code fallback, lock/unlock, auto-lock, recovery kit PDF, change master password, sessions list and revoke |
| E2 Vault core | Create, edit, delete and restore logins; folders and favourites; search; password generator; encrypted sync with conflict handling; offline cache |
| E3 Chrome extension | Popup unlock and search, login form detection, inline autofill dropdown, save-password prompt, update-password prompt, never-save list, generator in sign-up forms |
| E4 Import and export | Import Google Password Manager CSV, encrypted export |
| E10 Launch readiness | Security review fixes, accessibility (WCAG 2.2 AA), privacy policy, store listings, support page, production monitoring |

Platforms at MVP: web (installable PWA), iPhone, Android, Chrome.

## Explicitly out of the MVP (ships later)

| Epic | Capability | Release |
| --- | --- | --- |
| E5 | Phone autofill (Android Autofill Service, iOS AutoFill), biometric unlock | 1.1, 1.2 |
| E6 | Families, teams, shared vaults, roles, organizer/manager recovery, audit log | 1.3 |
| E7 | Apple Silicon Mac build, responsive web polish | 1.3 |
| E8 | Secure notes, SSL certificates, file attachments | 1.4 |
| E9 | Passkey unlock (PRF), password health, breach check, Bitwarden/1Password import | 1.5 |

## Constraints and assumptions
- One developer, 2-week sprints, Sprint 0 starts 2026-10-19.
- Zero-knowledge architecture: the server never holds anything that can decrypt a vault.
- No Secret Key; passkeys are the second factor. Forgotten master password: recovery kit for everyone; organizer/manager recovery arrives in 1.3.
- Self-hosted VPS (staging and production), storage behind `VaultRepository` and `BlobStore` interfaces.
- No real user data reaches production before the Phase 4 security gate passes.

## Exit gate
The owner signs off this scope and the stories in [user-stories.md](user-stories.md). Changes to MVP scope after sign-off go through an ADR in `docs/adr/`.
