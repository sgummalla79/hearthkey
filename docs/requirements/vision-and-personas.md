# Vision and Personas

Status: draft for sign-off (Phase 1). Source: [../plan.md](../plan.md).

## Vision

Hearthkey is a password manager for individuals, families and small teams, where the server can never read your data. Everything is encrypted on your device; the server stores only ciphertext. It works on the web, iPhone, Android and Chrome, and is built to grow into shared vaults, recovery by a trusted organizer, notes and SSL certificates.

## Product principles
1. **Zero-knowledge first.** If a feature requires the server to read vault data, we do not build it that way.
2. **Safe by default, recoverable by design.** Strong defaults, plain-language warnings, and a clear recovery path for forgotten master passwords.
3. **One core, every platform.** Identical crypto and behaviour on web, mobile and extension.
4. **Extensible items.** New item types (notes, certificates) are added without server changes.
5. **Quality gates do not move.** Dates move before tests or security checks are skipped.

## Personas

| Persona | Who they are | Goals | Pain points | Appears in |
| --- | --- | --- | --- | --- |
| **Individual** | A person managing their own logins across phone and laptop | Never reuse or forget passwords; fill logins quickly; trust the service | Browser-saved passwords feel unsafe or tied to one vendor; migrating is tedious | MVP |
| **Family organizer** | The person who sets up shared access for up to 6 family members | Share the Wi-Fi, streaming and bank logins; help a family member who forgot their password | Relatives forget master passwords; sharing over chat is insecure | 1.3 |
| **Team manager** | Leads a small team that shares service credentials and certificates | Share vaults by role; revoke access when someone leaves; recover a member | Credentials in spreadsheets; offboarding leaves access behind | 1.3 |
| **Member** | A family or team member with a private vault plus shared vaults | Keep private items private; use shared items easily | Unclear who can see what | 1.3 |

## Success measures (MVP)
- A new user can sign up, add a login and autofill it in Chrome in under five minutes.
- No critical or high security findings open at launch.
- Data created on one platform opens correctly on every other platform.
- Crash-free sessions and sync success rate meet the targets in [non-functional-requirements.md](non-functional-requirements.md).

## Out of scope for now
Passkey storage, credit cards and identities, Edge, Firefox and Safari extensions, emergency access, a native Mac app.
