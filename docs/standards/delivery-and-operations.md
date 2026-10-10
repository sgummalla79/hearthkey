# Delivery, Operations and Accessibility Standards

## 1. Git, review, and delivery
- **Never work directly on `main`.** Every feature, bug fix, refactor, docs change, and chore is done on its own branch created from an up-to-date `main`, and reaches `main` only through a pull request.
- Workflow is GitHub Flow: `main` is always deployable; branches are short-lived (aim for days, not weeks) and small; one purpose per branch.
- Branch names: `<type>/<issue-id>-<short-description>`, with type one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `hotfix` (e.g. `feat/123-passkey-signup`, `fix/207-sync-conflict`).
- Branch protection on `main` (enforced in GitHub, not by convention): PR required, CI status checks required, at least one review (or documented self-review plus automated review while the team is one developer), up-to-date branch required, conversations resolved, linear history (squash merge), no force-push, no deletion, applies to admins.
- Delete branches after merge. Rebase or merge `main` into your branch regularly to avoid long-lived drift.
- Hotfixes follow the same rule: branch from `main`, PR, tag.
- Commits are signed (GPG/SSH) where possible. Never commit secrets; secret scanning and push protection are on.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`). Subject in imperative mood, body explains why.
- Semantic Versioning for releases (`vMAJOR.MINOR.PATCH`, pre-releases like `-beta.1`) with a generated changelog.
- PR descriptions state what changed, why, how it was tested, and any security impact; PRs are small enough to review in one sitting.
- Every PR: self-review against these standards, automated review, tests, updated docs/ADR when architecture or behavior changes. Security-sensitive PRs get explicit security notes in the description.
- Unfinished work ships behind feature flags (config-driven), never on long-lived branches.
- The Definition of Done is in [../plan.md](../plan.md); it is part of these standards.
- Record significant decisions as ADRs in `docs/adr/`.

## 2. Observability and operations
- Structured JSON logs with levels, correlation ids, and a redaction layer. Never log secrets, keys, URLs, item titles, or request bodies containing encrypted payloads.
- Health and readiness endpoints, uptime and disk-space alerts, error tracking with scrubbing.
- Container images are minimal, run as non-root, with read-only filesystems where possible; deploys are rollbackable with one command.
- Keep an incident response runbook (key compromise, data breach, bad release) and rehearse backup restore.

## 3. Accessibility and UX
- WCAG 2.2 AA. All interactive elements have accessible labels, keyboard navigation, visible focus, and sufficient contrast; support screen readers and dynamic type.
- Security UX is explicit: plain-language warnings for irreversible actions (master password loss, recovery enrollment trade-offs).
- UI strings come from a localization layer/config, not inline literals.

## 4. Reliability (SRE practices)
- Define SLOs from the start (for example API availability, sync latency, error rate) with values kept in config/monitoring, not in code. Alert on SLO burn, not on every blip.
- Incidents follow detect, mitigate, communicate, resolve. Every sev-1 or sev-2 incident gets a blameless postmortem using [../templates/postmortem.md](../templates/postmortem.md) with tracked action items.
- Rehearse restores and rollbacks; a backup that has not been restored is not a backup.

## 5. Reference frameworks
- **Twelve-Factor App:** config in the environment, stateless processes, dependencies declared, logs as event streams, dev/prod parity.
- **SLSA and OpenSSF Scorecard:** target SLSA build provenance for release artifacts and track the Scorecard result for the repo.
- **Semantic Versioning, Conventional Commits, GitHub Flow, OWASP ASVS/MASVS, WCAG 2.2 AA** as referenced above.

## 6. Repository governance files
- `.github/CODEOWNERS`: ownership and required review for security-critical paths (update the paths as packages are created).
- `.github/pull_request_template.md`: the standard PR checklist.
- `SECURITY.md`: private vulnerability disclosure policy.
