# ADR-0003: Cryptographic primitives and library

- Status: Proposed (pending review; see [crypto spec](../security/crypto-spec.md))
- Date: 2026-10-10
- Deciders: Suman Gummalla

## Context

Hearthkey is zero-knowledge: all encryption happens on the client, and the same code must behave identically on web, iPhone, Android and the Chrome extension. The code must run in a browser, a Manifest V3 service worker and React Native.

## Decision

Use **libsodium** only, through `vault-core` (`libsodium-wrappers` on web and extension, `react-native-libsodium` on mobile). No other crypto library and no hand-written primitives.

| Purpose | Primitive | libsodium API |
| --- | --- | --- |
| Password to master key | Argon2id (v1.3) | `crypto_pwhash` with `ALG_ARGON2ID13` |
| Key separation (auth key, key-encryption key) | HKDF-SHA256, or libsodium `crypto_kdf` (BLAKE2b) if HKDF is not exposed by the pinned wrapper | `crypto_kdf_hkdf_sha256_*` / `crypto_kdf_derive_from_key` |
| Authenticated encryption, key wrapping | XChaCha20-Poly1305 (IETF AEAD), random 192-bit nonces | `crypto_aead_xchacha20poly1305_ietf_*` |
| Asymmetric key pair, sealing keys to a public key | X25519 with sealed boxes | `crypto_box_keypair`, `crypto_box_seal` |
| Randomness | Platform CSPRNG via libsodium | `randombytes_buf` |
| Constant-time comparison | libsodium | `sodium_memcmp` |
| Memory wiping | libsodium | `sodium_memzero` |

## Alternatives rejected

- **WebCrypto.** Not available identically in React Native, and Argon2id is not provided. PBKDF2 is a weaker password KDF against GPUs.
- **OPAQUE (aPAKE).** Stronger because the server never sees even a derived auth key, but newer, with less mature mobile libraries. Kept as a later upgrade path (the plan already notes this).
- **Secret Key (1Password-style).** Decided against in the plan; passkeys are the second factor.
- **AES-GCM.** Needs careful nonce management (96-bit nonces); XChaCha20-Poly1305's 192-bit random nonces remove that risk.
- **Rolling our own protocol pieces.** Prohibited by the standards.

## Consequences

- One audited library and identical algorithms on every platform; interop is tested with shared known-answer vectors.
- Mobile needs a native module (`react-native-libsodium`).
- JavaScript cannot guarantee that key material is wiped from memory; mitigations are in the crypto spec.
- Whether the pinned wrapper exposes HKDF must be checked in Sprint 1; the fallback keeps the same key-separation properties and is recorded as a versioned algorithm id so it can be changed later.
