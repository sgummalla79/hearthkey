# Security Standards (zero-knowledge)

Baselines: OWASP ASVS L2 for web/API, OWASP MASVS L2 for mobile, OWASP Top 10, OWASP API Security Top 10. Treat the checklist as a release gate. Read this before changing auth, crypto, sharing, recovery, logging, or the extension.

## 1. Zero-knowledge invariants (never violate)
- The master password, master key, user symmetric key, private keys, vault keys, and decrypted item data never leave the device and are never sent to the server, logged, or reported to crash tools.
- The server stores only: ciphertext, wrapped keys, public keys, and the Argon2id hash of the derived authentication key.
- All encryption and decryption happens in `vault-core`. No client or server code implements its own crypto.

## 2. Cryptography
- Use only libsodium via `vault-core`: Argon2id (KDF), XChaCha20-Poly1305 (AEAD), X25519 (key exchange/sealing), HKDF for key separation. No custom primitives, no rolling your own protocols, no MD5/SHA-1/ECB/CBC-without-MAC.
- Generate all keys, nonces, salts, and tokens with the libsodium or platform CSPRNG. Never `Math.random()`.
- Never reuse a nonce with the same key. Bind items to context with AEAD associated data (item id + vault id).
- KDF parameters are configuration, versioned, and stored alongside the data so they can be raised later. Tune on the slowest supported phone.
- Every encrypted blob carries a format/version field so algorithms can be migrated.
- Compare secrets and MACs in constant time. Zero key material in memory as soon as it is no longer needed (`sodium_memzero`) where the runtime allows.
- Every crypto function ships with known-answer test vectors and a cross-platform interop test (encrypt on one platform, decrypt on all others).
- Any change under `vault-core/crypto`, key wrapping, sharing, or recovery requires an updated crypto spec/ADR and review before merge.

## 3. Authentication and sessions
- Authentication is derived-auth-key (never the password) plus a passkey (WebAuthn) second factor; TOTP and one-time recovery codes are fallback. Organizer/manager roles require a passkey.
- Short-lived access tokens, rotating refresh tokens, server-side revocation, a sessions list, and sign-out of all sessions on password change or recovery.
- Rate-limit and lock out login, signup, recovery, invite, and 2FA endpoints per account and per IP. Use uniform responses and timings to prevent account enumeration.
- Recovery flows keep the 24-hour wait, notifications to the member, cancellation, and audit log entries. The approver never sees or chooses the new master password.
- Sensitive actions (change password, add/remove passkey, export, recovery approval) require recent re-authentication.

## 4. API and server hardening
- Validate every request at the boundary with Zod (body, params, query, headers); reject unknown fields. Never trust client-supplied ids, roles, or sizes.
- Authorize on every request, server-side, per resource (vault membership, role). Deny by default. Prevent IDOR/BOLA by always scoping queries to the authenticated principal.
- Parameterized queries only, via Drizzle. No string-built SQL.
- Set strict CORS allow-lists, HSTS, `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Cache-Control: no-store` on authenticated responses.
- Enforce request size limits, timeouts, and pagination caps (all from config). Return generic error messages for internal failures; never leak stack traces, SQL, or internals.
- TLS 1.2+ everywhere; Caddy terminates HTTPS. PostgreSQL and MinIO are reachable only on the private network.
- Least privilege: separate DB roles for migrations vs runtime; the runtime role cannot alter schema.
- Audit log for security-relevant events (login, session revoke, role change, member removal, recovery). Logs contain ids and event types, never secrets, URLs, or item titles.

## 5. Client security
- **Extension:** fill only on an exact registrable-domain match (Public Suffix List); never auto-fill in cross-origin iframes; confirm before filling on plain HTTP. Decrypted data lives only in the service worker and `chrome.storage.session`. Content scripts receive only the single item being filled. Minimal manifest permissions; no remote code; strict extension CSP; no `eval`.
- **Web:** strict CSP, no inline scripts, Subresource Integrity for third-party assets (prefer none), no secrets in `localStorage`. Sanitize any rendered user content; avoid `dangerouslySetInnerHTML`.
- **Mobile:** keys in Secure Enclave / Android Keystore, biometric unlock bound to the keystore, `FLAG_SECURE`/screenshot protection on sensitive screens, clipboard auto-clear, auto-lock, no sensitive data in backups or app snapshots.
- Clipboard, autofill, and export features clear or expire sensitive data after a configured timeout.

## 6. Secrets, dependencies, and supply chain
- No secrets in the repo, images, logs, or client bundles. Secrets come from environment/secret stores; `.env` files are git-ignored and an `.env.example` documents the names only.
- Pin dependencies with a lockfile; install with `pnpm install --frozen-lockfile` in CI. Renovate keeps them current. Prefer few, well-maintained dependencies, and review every new one (license, maintainers, install scripts). Disable lifecycle scripts for packages that do not need them.
- CI runs CodeQL, `pnpm audit`, secret scanning, and container image scanning. No merge with new critical/high findings.
- Sign releases and use provenance where supported. Deploys come only from GitHub Actions with a dedicated, least-privilege deploy key.
- Crash/observability tools (Sentry) must scrub secrets, URLs, and titles before sending.

## 7. Privacy
- Collect the minimum data. No third-party analytics SDKs in vault screens. Honor deletion: account deletion removes all server data. Document what the server stores.
