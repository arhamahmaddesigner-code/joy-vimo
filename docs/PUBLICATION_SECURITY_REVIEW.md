# Publication security review — 2026-11-10

Status: **PREPARED, NOT APPROVED FOR PUBLIC VISIBILITY YET**.

## Confirmed

- The default-branch source tree contains 109 tracked files as checked in this review, including workflow files, Android native code and Supabase migrations.
- A pattern scan of 108 available current non-lockfile text blobs found no recognizable private-key blocks, GitHub personal-access tokens, Supabase secret-role keys, AWS access keys or literal JWTs. This is a *pattern scan*, not a comprehensive secret-security audit.
- Apparent password matches in `scripts/privacy_preflight.py` were test assertions about workflow variables, not credential values. Email addresses in unit tests were examples.
- The repository stores its dedicated Supabase URL and a *publishable* client key. Those are intended to be usable by clients, but live RLS/function grants must be independently reviewed.
- Scanned sample historical commit trees showed no obvious tracked `.env`, signing keystore or private-key files.
- The existing commit history includes an identifiable personal Gmail address in author metadata; publication would expose it and other old commit metadata.
- The user permits publication of application source code, not access to unrelated private repositories, account settings or other databases.

## Outstanding blockers

1. **Full history audit:** roughly 359 commits were identified. Sampled historical trees and the present source were inspected; this is not a complete scan of all removed/replaced historical file contents and GitHub Actions job logs.
2. **Live backend:** independently check the dedicated JOY VIMO Supabase project's RLS, function permissions, anonymous access, 2+ authenticated account isolation, potential abuse and data deletion; access was not available to perform this audit in the connected session. Do **not** modify the unrelated ORYX project.
3. **Commit privacy:** the old commit author email remains in Git history. Use a fresh public repository without transferring history, or deliberately accept this exposure. A private-to-public visibility switch cannot strip historical commit metadata.
4. **Third-party rights:** independently check that logos, generated art and other assets can be redistributed; the MIT license only applies to material whose rights the owner actually controls.
5. **Actions:** inspect historical logs for accidental secrets and make sure publishing does not expose artifacts or enable unsafe forked-PR workflows.

## Recommendation

**Do not flip this repository to Public without clearing the blockers.** If public source is needed promptly, create a clean, security-reviewed public export with fresh history, no connected backend credentials, and keep the original working repository private. Public visibility alone does not make an early-stage repository eligible for a six-month open-source subscription offer.

After passing checks, change visibility manually through GitHub **Settings → General → Danger Zone → Change repository visibility**. The connected GitHub app does not provide an administration/visibility update action, and this audit did not change visibility.
