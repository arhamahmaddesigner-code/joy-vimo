# JOY VIMO source and release audit — 2026-10-19

Baseline: `main` commit `c1d5fdab399838e8c916ee78f16f7da82c157605` (95 tracked files).
This audit supersedes dated progress claims in the older scope/gap documents, not the agreed feature scope.

## Verified evidence

- [Internal Android build #51](https://github.com/arhamahmaddesigner-code/joy-vimo/actions/runs/39269207698): completed/success; unit/privacy/JSX, Expo prebuild and release compilation passed. No APK uploaded.
- Latest 20 Actions checked: internal builds #36–51 passed. Older [pre-APK run #6](https://github.com/arhamahmaddesigner-code/joy-vimo/actions/runs/38939834566) failed only its privacy lane (`Feed hidden preferences must persist and support restoring`). The assertion passes in the audited current source and #51; historical run is not relabeled green.
- No open issues/PRs returned by repository-scoped issue search. Release gaps primarily live in source/documents, not GitHub issues.
- All 22 baseline CJS test files and privacy preflight passed locally. Most component/native/security tests assert source strings or pure helpers; they are NOT device or backend end-to-end tests.
- #51 job log explicitly reports at least one of the four protected signing inputs missing. Internal signing uses a disposable runner key.
- `VIDEO_ENTRIES` is empty. Player/catalogue validation exist, but there is no approved entertainment-video collection.
- All four live Supabase inspection requests (project, migrations, security advisors, SQL) returned `You do not have permission to perform this action`. No live database was changed and no live OTP/security result is claimed. ORYX was not accessed.

## Feature reality

| Area | Source evidence | Remaining acceptance |
| --- | --- | --- |
| Age onboarding, interests, child/teen local modes | App.js, policy helpers | Emulator coverage added; guardian checkbox is not age/guardian assurance |
| Focus Shield, app opens/minutes/session/pause, strict schedules, safe exit | Native Kotlin module/service/activity and controls | OEM permission/lifecycle, reboot, lock, battery and third-party app regression |
| Known installed apps / usage | Native allowlist of four packages | Usage event accuracy and overnight boundaries on device |
| Chrome domains, Shorts/Reels/TikTok | Separate opt-ins, narrow selectors and truthful experimental copy | Supported app-version reliability; no universal filtering promise |
| Coach, reset, goals, XP, progress, rewards | Integrated screens/helpers | Full UI/accessibility and lifecycle QA |
| Companion, privacy export, daily reminders | Already integrated into App.js | Do not repeat old “missing integration” tasks; device behavior remains unverified |
| Offline activities, Memory Garden, hide/report preferences | Wired into feed; serialized persistence | Existing automated checks pass; rendered/end-to-end regression needed |
| Licensed curated videos | Manual player with retry, finite filtering; zero catalogue entries | Actual rights, age review, playable assets, hide/report handling for videos |
| Adult leaderboard/email OTP | Client auth UI, secure token adapter, SQL/RLS/RPC source | Live email template/delivery/expiry, two real accounts, PostgREST/RLS, alias/rank/leave/delete |
| Signing and upgrade | Secret-based signing and APK certificate comparison code | Four stable secrets absent/unverified, private key unlock and stable install/upgrade evidence |
| Privacy deletion | Local erase barrier, native/auth/reminder cleanup; leaderboard data-delete RPC | Auth account deletion is not implemented by the leaderboard-data delete operation; retain accurate wording |
| Build reproducibility | Previously npm install + runtime expo --fix; no lockfile | This batch commits lockfile and uses npm ci + Expo --check |
| Android QA | Previously compile-only; no instrumentation/emulator suite | This batch adds internal offline UI smoke; broad device QA remains open |

## Defects found and code changes

1. Reproduced runtime failure in the read-gate SQL: `function pg_catalog.coalesce(bigint, integer) does not exist`. COALESCE is SQL syntax, not a schema-qualified function. Added forward repair `20261019164028_repair_leaderboard_read_gate.sql`; NOT deployed live.
2. Added isolated PostgreSQL engine tests with synthetic identities: 57 checks cover old failure reproduction, repaired rankings, RLS, anonymous/no-identity rejection, direct-write denial, duplicate claims/daily caps, country/week calculations, opt-out, and deletion that preserves the other account. This uses an auth.uid test shim, not GoTrue/PostgREST or real email.
3. Client overrides previously accepted any HTTPS project. Added exact JOY VIMO endpoint and publishable-key validation; another project or secret key now leaves the client disabled.
4. Consolidated test discovery so new regressions cannot silently be omitted from hand-maintained workflow lists. Added lockfile; pinned resolved Supabase client and test-only PGlite. CI checks compatibility without rewriting dependencies.
5. Added internal emulator smoke at API 35 for adult 360dp/1.0x, teen 390dp/1.3x, child 430dp/1.5x, offline navigation, private minor ranking controls and onboarding persistence. This is a sampled layout matrix, not exhaustive accessibility/OEM coverage.
6. Both native workflows now share sequential concurrency. Owner distribution also requires explicit internal integrated-QA evidence; a green compile cannot satisfy this automatically.
7. Recorded the owner's existing conditional private-APK authorization. No additional approval is needed merely to continue this authorized work. Technical release flags remain false.

## Accurate remaining-work order

1. **Backend access + deployment:** reconnect/authorize the existing JOY VIMO Supabase project only. Read actual migration history and deployed functions before applying the repair. Historical files share a date-only version and sort read-gate before base schema; do NOT blindly `db push` or rewrite deployed history. Reconcile this with live history first.
2. **Live OTP/security:** verify numeric email template and delivery using two authorized QA mailboxes; test expired/reused codes, network recovery, sessions/sign-out, own/other-user REST access, RPC grants, join/claim/rank/leave/delete. Review all five SECURITY DEFINER capabilities. Self-declared adulthood and capped self-reported scores are not verified age/anti-cheat.
3. **Content:** obtain short creator-licensed/owned assets and documentary rights (app streaming, commercial use, territories, expiry), perform human age/content review, then implement video feedback/attribution and playback/revocation QA. Never fill the catalogue with unreviewed demos or invent reviewers/permissions.
4. **Signing:** configure `JOY_QA_KEYSTORE_BASE64`, `JOY_QA_STORE_PASSWORD`, `JOY_QA_KEY_ALIAS`, `JOY_QA_KEY_PASSWORD` in repository Actions secrets; preserve the keystore privately. No connector secret-write capability is available in this session. Never paste private signing material into a chat or commit it.
5. **Integrated Android QA:** verify the new deliberate build and emulator evidence, then complete permissions/native lifecycle, UI/accessibility, reduced motion, notifications, export/erase, startup/memory/battery and install/upgrade testing internally where available. Record gaps accurately.
6. **One owner handoff:** only after content/backend/signing/internal acceptance gates pass, produce ONE signed private APK with SHA256, certificate fingerprint and versionCode. Realme C71 walkthrough follows that complete candidate, not before it. Physical OEM behavior cannot be certified from CI.

No Play Store or iOS publication is authorized. No promised feature is silently deferred. Public launch/age-policy review remains separate from the private owner-review gate.
