# MVP User Stories and Acceptance Criteria

Status: draft for sign-off. Epics E0 to E4 and E10. Each story becomes a GitHub issue under its epic milestone. A story enters a sprint only when it meets the Definition of Ready and is finished per the Definition of Done in [../plan.md](../plan.md). Sprint assignment follows the plan.

Format: **As a** persona, **I want** capability, **so that** benefit. Criteria are written Given/When/Then.

## E0 Foundation (Sprint 0)

**E0-1 Monorepo and tooling.** As the developer, I want a pnpm/Turborepo monorepo with strict TypeScript, lint, format and test tooling, so that every package follows the standards.
- Given a fresh clone, when I run install, build and test, then all packages build and tests pass.
- Lint and format failures block CI.

**E0-2 CI/CD.** As the developer, I want GitHub Actions to build, test and scan every PR and deploy tagged releases, so that quality gates are automatic.
- Given a PR, when CI runs, then unit, lint, type-check, CodeQL, dependency audit and secret scanning run and gate the merge.
- Given a release tag, when CI runs, then images and all four clients publish to their test channels.

**E0-3 Environments.** As the developer, I want local, preview, staging and production environments, so that a build is proven before launch.
- Staging and production VPSs are provisioned from the same script, hardened, and reachable over HTTPS.
- Production is separate from staging, with backups and monitoring.

**E0-4 Developer accounts.** As the owner, I want Apple, Google Play and Chrome Web Store accounts opened, so that test channels work.

**E0-5 Crypto spec and threat model.** As the owner, I want a written crypto spec and threat model reviewed before any vault data is stored.
- The spec covers the key hierarchy, KDF parameters, formats and versioning, and the recovery design.

**E0-6 Design system.** As a user, I want consistent, accessible UI components across platforms.

**E0-7 Walking skeleton.** As the developer, I want a "hello Hearthkey" build passing through every environment and test channel.
- Given the tag, when deployed, then web, TestFlight, Play internal and the Chrome private listing each show the build.

## E1 Accounts and keys (Sprints 1 to 2)

**E1-1 Sign up.** As an individual, I want to create an account with email and master password, so that I own an encrypted vault.
- Given valid input, when I sign up, then keys are derived and wrapped on-device and the server receives only the auth key hash, wrapped keys and public key.
- The master password never appears in any request, log or crash report.

**E1-2 Password strength meter.** As an individual, I want feedback on my master password strength, so that I choose a strong one.
- Weak passwords show a warning; the threshold comes from configuration.

**E1-3 Log in.** As an individual, I want to log in on any device, so that I can access my vault.
- Given correct credentials and second factor, when I log in, then my vault decrypts locally.
- Wrong credentials return a uniform error with no account enumeration; repeated attempts are rate limited (429).

**E1-4 Passkey second factor.** As an individual, I want to add a passkey, so that phishing cannot steal my account.
- Given a registered passkey, when I sign in, then I must present it on the real Hearthkey domain.
- TOTP and 10 one-time recovery codes work as fallback.

**E1-5 Lock, unlock and auto-lock.** As an individual, I want my vault to lock automatically, so that a lost or idle device is safe.
- After the configured idle time, the vault locks and keys are cleared from memory.

**E1-6 Recovery kit.** As an individual, I want to download a recovery kit PDF, so that I can regain access if I forget my master password.
- Onboarding warns clearly that without the kit or an organizer, data is lost permanently.

**E1-7 Change master password.** As an individual, I want to change my master password, so that I can respond to a suspected leak.
- New keys wrap the existing user key, and all other sessions are signed out.

**E1-8 Sessions.** As an individual, I want to list and revoke signed-in sessions (completed in Sprint 8), so that I control where I am signed in.

## E2 Vault core (Sprints 3 to 4)

**E2-1 Create, edit, delete, restore logins.** As an individual, I want to manage login items, so that my credentials are stored securely.
- Items are encrypted with the vault key, bound to item id and vault id, before leaving the device.
- Deleted items can be restored for the configured retention period.

**E2-2 Folders and favourites.** As an individual, I want to organize and favourite items, so that I find them quickly.

**E2-3 Search.** As an individual, I want to search my vault locally, so that results are instant and private.

**E2-4 Password generator.** As an individual, I want to generate strong passwords with configurable options.

**E2-5 Encrypted sync.** As an individual, I want changes to sync between phone and web.
- Given an edit on one device, when another device syncs, then it receives the update.
- Concurrent edits to the same item return 409 and are resolved without data loss.

**E2-6 Offline access.** As an individual, I want to use my vault offline.
- Given no network, when I open the app, then I can view, search and (queued) edit items; edits sync on reconnect.

## E3 Chrome extension (Sprints 5 to 7)

**E3-1 Popup unlock and search.** As an individual, I want to unlock the extension and search my vault.
- Keys live only in the service worker and `chrome.storage.session`; they are cleared when Chrome closes.

**E3-2 Form detection.** As an individual, I want login forms detected on real sites.
- Detection passes the 30+ page "form zoo" (multi-step, iframes, SPA, shadow DOM) with a manual "fill" fallback.

**E3-3 Inline autofill.** As an individual, I want an inline dropdown to fill my login.
- Fills only on an exact registrable-domain match; never in cross-origin iframes; confirmation on plain HTTP.

**E3-4 Save and update prompts.** As an individual, I want to be offered saving a new login or updating a changed password.

**E3-5 Never-save list.** As an individual, I want to exclude sites from save prompts.

**E3-6 Generator in sign-up forms.** As an individual, I want to generate a password where I sign up.

## E4 Import and export (Sprint 7)

**E4-1 Import Google Password Manager CSV.** As an individual, I want to import my existing passwords.
- Given a valid CSV, when imported, then items are encrypted on-device; malformed rows are reported without aborting the whole import; the CSV is never uploaded.

**E4-2 Encrypted export.** As an individual, I want an encrypted export of my vault.
- Export requires recent re-authentication and is encrypted with a user-chosen password.

## E10 MVP launch readiness (Sprint 8)

**E10-1 Security review fixes.** As the owner, I want no open critical or high findings from the independent review.

**E10-2 Accessibility.** As a user with accessibility needs, I want WCAG 2.2 AA conformance on all clients.

**E10-3 Privacy policy and support page.** As a user, I want to know what is stored and how to get help.

**E10-4 Store listings.** As the owner, I want App Store, Play and Chrome Web Store listings approved.

**E10-5 Production monitoring.** As the owner, I want uptime, error and disk alerts and a tested restore before launch.
