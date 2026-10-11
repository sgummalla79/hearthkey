# Hearthkey Cryptographic Specification (v1, Sprint 1 scope)

Status: **Draft for review.** Must be reviewed and approved before any vault data is stored (Phase 2 exit gate). Primitives are chosen in [ADR-0003](../adr/0003-cryptographic-primitives.md). Threats are in [threat-model.md](threat-model.md).

Scope of this version: account creation, login, key hierarchy for a personal vault, item encryption, change of master password. **Out of scope until later sprints** (placeholders only): shared vaults and member invites (Sprints 11 to 12), organizer/manager recovery (Sprint 13), passkey PRF unlock (Sprint 15), biometric unlock (Sprint 10).

All numeric parameters below are defaults. They live in versioned configuration, are stored with the data they protect, and must not be hardcoded in application logic.

## 1. Goals and non-goals

Goals:
- The server never learns the master password, any key that can decrypt a vault, or any plaintext.
- A full database leak yields only ciphertext, wrapped keys, public keys and slow-to-guess password verifiers.
- Identical behaviour on web, mobile and the Chrome extension.
- Algorithms and parameters can be upgraded without data loss (versioning).

Non-goals:
- Protection against a fully compromised client device while the vault is unlocked.
- Hiding metadata the server must know (account email, item counts, ciphertext sizes, timestamps, vault membership).

## 2. Notation

- `||` concatenation. All keys are 32 bytes unless stated. `KDF(key, info)` is the key-separation function from ADR-0003 with a distinct, fixed `info` label per use.
- `AEAD_Enc(key, plaintext, ad)` is XChaCha20-Poly1305 with a fresh random 24-byte nonce; output is described in section 5.
- `Seal(pk, msg)` is a libsodium sealed box to X25519 public key `pk`.

## 3. Key hierarchy

| Key | Created | Stored where | Purpose |
| --- | --- | --- | --- |
| Master password | User | Nowhere (memory only while typing) | Root secret |
| Salt | Client, random 16 bytes, at sign-up | Server (public) | Input to the password KDF |
| Master key | `Argon2id(password, salt, params)` | Never stored | Root of the derivation |
| Authentication key | `KDF(master key, "hearthkey/v1/auth")` | Never stored on the server; only its hash | Proves knowledge of the password at login |
| Key-encryption key (KEK) | `KDF(master key, "hearthkey/v1/kek")` | Never stored | Wraps the user key |
| User symmetric key | Client, random | Server, wrapped by the KEK | Wraps private key and personal vault keys |
| X25519 key pair | Client, random | Public key plain; private key wrapped by the user key | Receives sealed shared-vault keys (later) |
| Vault key | Client, random, one per vault | Server, wrapped by the user key (personal) | Encrypts items in that vault |

Rules:
- The authentication key and KEK use different `info` labels, so learning one reveals nothing about the other or the master key.
- The master key is used only to derive these two keys, then discarded.
- Only the wrapped keys, public key, salt, KDF parameters and the server-side verifier ever leave the device.

## 4. Password KDF parameters

- Argon2id version 1.3 via `crypto_pwhash`, output 32 bytes, parallelism fixed by libsodium.
- Defaults: **64 MiB memory, 3 passes** (from the plan), tuned in Sprint 1 on the slowest supported phone so that a derivation takes a few hundred milliseconds there. Values are configuration, with a hard floor enforced by tests and the server (reject sign-ups below the floor).
- Stored per user next to the salt as `kdfVersion`, `memLimitBytes`, `opsLimit`. Raising the parameters later happens at the next successful login: derive with old parameters, re-derive with new ones, re-wrap the user key (see 8.3).
- The parameters returned by the server are untrusted input: the client rejects values below the floor or above a ceiling that would exhaust device memory.

## 5. Encrypted blob format

Every ciphertext (wrapped key, vault item, attachment metadata) uses one envelope:

```
byte 0       formatVersion   (1 = this spec)
byte 1       algorithmId     (1 = XChaCha20-Poly1305-IETF)
bytes 2..25  nonce           (24 random bytes)
bytes 26..   ciphertext || 16-byte Poly1305 tag
```

- Associated data (authenticated, not stored in the blob) is a canonical encoding of `formatVersion || algorithmId || purposeLabel || contextIds`, where `purposeLabel` is a fixed string such as `user-key`, `private-key`, `vault-key`, `item`, and `contextIds` are the ids that bind the ciphertext to its place:
  - wrapped user key: `userId` (set after account creation; at creation the label alone is used and the wrap is re-bound on first login if needed, see open question Q2)
  - wrapped private key: `userId`
  - wrapped vault key: `userId || vaultId`
  - item: `vaultId || itemId || itemType || revision`
- Binding to ids prevents the server from swapping ciphertexts between items, vaults or users.
- A decryption failure is always a hard error; no fallback to an older algorithm without an explicit migration.
- A fresh random nonce is generated for every encryption. With 192-bit nonces the collision probability is negligible for the data volumes involved; a nonce is never derived from a counter or reused with the same key.

## 6. Sign-up

1. User enters email and master password. The client checks strength against the configured policy and the Argon2id floor.
2. Client generates `salt` (16 random bytes) and loads KDF parameters from server configuration (via an unauthenticated, cacheable endpoint).
3. Client computes `masterKey`, `authKey = KDF(masterKey, "hearthkey/v1/auth")`, `kek = KDF(masterKey, "hearthkey/v1/kek")`, then zeroes `masterKey`.
4. Client generates `userKey` (32 random bytes), an X25519 key pair, and a personal `vaultKey`.
5. Client computes `wrappedUserKey = AEAD_Enc(kek, userKey, ad)`, `wrappedPrivateKey = AEAD_Enc(userKey, privateKey, ad)`, `wrappedVaultKey = AEAD_Enc(userKey, vaultKey, ad)`.
6. Client sends: email, `salt`, KDF parameters, `authKey`, `wrappedUserKey`, `publicKey`, `wrappedPrivateKey`, personal vault id and `wrappedVaultKey`.
7. Server validates input (schema, parameter floor), computes `authKeyHash = Argon2id(authKey, serverSalt, serverParams)` with its own random salt and parameters from server configuration, and stores the record. The `authKey` itself is never stored or logged.
8. The client zeroes `authKey` and `kek`, keeps `userKey` in memory for the session.

The response must not reveal whether the email already existed beyond what the signup flow strictly requires (see threat model, enumeration).

## 7. Login

1. Client asks `POST prelogin` with the email. The server returns `salt` and KDF parameters. For unknown emails it returns a **deterministic fake** `salt` and default parameters derived from `HMAC(serverSecret, email)`, so unknown and known accounts look the same.
2. Client validates the parameters (floor and ceiling), derives `masterKey`, `authKey`, `kek` as in sign-up, zeroes `masterKey`.
3. Client sends `authKey` plus the second factor (passkey assertion, TOTP or recovery code) over TLS.
4. Server compares `Argon2id(authKey, serverSalt, serverParams)` to `authKeyHash` in constant time, applies rate limits and lockout, checks the second factor, and returns session tokens plus `wrappedUserKey`, `wrappedPrivateKey`, vault list and `wrappedVaultKey` values.
5. Client unwraps `userKey` with `kek` (failure means wrong password or tampering), then private key and vault keys, zeroes `authKey` and `kek`.
6. Wrong password and unknown account return the same error and take comparable time.

## 8. Account operations

### 8.1 Locking and unlocking
Locking clears `userKey`, private key and vault keys from memory. Unlocking on a device that still has the wrapped keys re-derives `kek` from the master password locally and unwraps them; no `authKey` is needed for a local unlock. Auto-lock timeouts are configuration values.

### 8.2 Change master password
1. Re-authenticate (current password plus second factor).
2. Client generates a new `salt`, derives new `masterKey`, `authKey'`, `kek'`.
3. Client re-wraps the existing `userKey` with `kek'`. Because `userKey` is unchanged, vault keys and items do not need re-encryption.
4. Server replaces `salt`, parameters, `authKeyHash` and `wrappedUserKey` in one transaction and revokes all other sessions.

### 8.3 KDF upgrade
At a successful login, if stored parameters are below current policy, the client re-derives with new parameters and performs the same steps as 8.2 with an unchanged password.

### 8.4 Rotating `userKey`
Needed after suspected key compromise. The client generates a new `userKey`, re-wraps the private key and every vault key, and uploads them atomically. Item ciphertexts do not change because they are encrypted with vault keys.

## 9. Vault items

- Each item is a JSON payload `{type, fields...}` serialized canonically and encrypted with the vault key using the envelope in section 5, with AD binding `vaultId || itemId || itemType || revision`.
- The server sees `itemId`, `vaultId`, `itemType`, `revision`, timestamps and ciphertext length. Item titles, URLs and usernames are inside the ciphertext.
- Concurrent updates are detected by `revision` (optimistic concurrency); a mismatch returns a conflict, and the client merges and re-encrypts.
- Domain matching for autofill is done on the client against decrypted data; the server never receives URLs.

## 10. Implementation requirements

- All of the above lives in `vault-core/crypto`, with no platform APIs. Platform specifics (random source, secure storage) enter through adapters.
- Key material is `Uint8Array`, never a string. Wipe with `sodium_memzero` after use. JavaScript cannot guarantee that copies are not left in memory (garbage collector, JIT); minimizing key lifetime and copies is the mitigation and is part of the review.
- Comparisons of secrets use `sodium_memcmp`. No custom crypto, no `Math.random`.
- Every function has **known-answer test vectors**, plus negative tests: tampered ciphertext, wrong AD, wrong key, truncated blob, unknown version.
- **Interop tests:** a fixture created on Node must decrypt in the browser, React Native and the extension, and vice versa. These run in CI.
- Server code must never import `vault-core/crypto` decryption functions. The server only handles opaque bytes and verifies `authKey` hashes.

## 11. Open questions for the reviewer

- **Q1.** Is Argon2id 64 MiB / 3 passes with a derived (not raw) authentication key an acceptable verifier design compared with OPAQUE, given the planned later upgrade path?
- **Q2.** Binding the wrapped user key to `userId` requires the id before the wrap is created. Options: client-generated UUID sent at sign-up and verified by the server (preferred), or re-wrap on first login.
- **Q3.** Does the pinned `libsodium-wrappers` / `react-native-libsodium` version expose HKDF-SHA256? If not, use `crypto_kdf_derive_from_key` with the same labels and record the algorithm id.
- **Q4.** Server-side verifier parameters and whether to add a server-held pepper (an HMAC key stored outside the database) to the verifier.
- **Q5.** Minimum acceptable and maximum acceptable client-side KDF parameters (floor and ceiling) for weak and flagship devices.
- **Q6.** Canonical serialization format for item payloads and AD (to avoid ambiguity attacks).
- **Q7.** Whether wrapping the personal vault key per item (an item key) is worth the extra complexity for future sharing of single items. Current design: share a single item by copying it into a shared vault.
