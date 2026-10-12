# JOY VIMO — Android integrated release scope (2026-10-12)

Status: ACTIVE INTEGRATION PLAN — NOT IMPLEMENTED/APPROVED.
Owner-directed workflow: build the cohesive Android product first, run internal automated QA repeatedly, then request ONE comprehensive Realme C71 owner walkthrough/video; fix the consolidated list and retest. Do not ask for a new video after each small change. Publish to Google Play only after owner approval + platform/policy/security checks. Begin iOS-specific device work after Android Play Store launch; preserve shared code compatibility.

## Product promise

"Enjoy your phone. Own your time." An optional, supportive wellbeing companion that helps people use the apps they already enjoy more intentionally. Never claim to cure masturbation, pornography consumption, addiction, or mental illness. Do not moralize sexual behavior. Private progress, no shame-based score penalties, safe exits.

## LOCKED visual requirements
- Owner-supplied JOY VIMO purple-gradient reference is the visual acceptance baseline: large multicolor wordmark with smile, rounded dark purple star-orbit app icon, refined vector treatment, legible high-contrast headings, expressive but non-intrusive animation, soft cards and consistent navigation.
- No tiny / cramped header or status-bar overlap. Pixel QA at 360, 390 and 430dp widths; large text font scale 1.3x and 1.5x; accessibility labels, screen readers, touch targets >=44dp.
- No emoji placeholders for primary UI icons. Use a consistent vector icon set. Feed must not masquerade as licensed videos if only sample cards.
- Smooth micro-interactions must respect reduced motion. Keep startup fast and battery impact measured.
- Consistent onboarding, Home, Focus Shield, app rules, schedule editor, safer browsing, curated Feed, Progress, Challenges, Rewards, Leaderboard, Reset, Profile, Settings, Permissions, Privacy, Support, data deletion.

## Integrated feature matrix / acceptance contracts

| ID | Area | Acceptance requirement | Verification gate |
| --- | --- | --- | --- |
| F01 | Setup | Age range + simple intent + optional interests; can skip personal/sensitive detail | UI/instrumented QA |
| F02 | Ages 10-12 | Parent-supported local-only mode: no cloud profile, no public leaderboard, no access to sensitive category history, no tracking/monitoring enabled by default | family/privacy review |
| F03 | Ages 13-17 | Restricted private mode, no public ranking, transparent local permissions | privacy/policy |
| F04 | Adults | Local-first personal mode, optional features with explicit consent | permissions QA |
| F05 | App usage | Usage Access reads limited package names and aggregated times on-device, not URLs or screen contents | Realme C71 / OEM regression |
| F06 | Permission clarity | Distinct descriptions of Usage Access vs Accessibility; system toggles, revocation, accurate live status; optional by default | live-device QA |
| F07 | App-opening rules | User-defined daily opening limit per chosen app, configurable 1..30, reset by local date | native + manual QA |
| F08 | Daily minutes | Per-app configurable time budgets using measured foreground use, day reset | native + manual QA |
| F09 | Session breaks | Configurable time per uninterrupted session; useful reminder or interruption | native lifecycle QA |
| F10 | Open pause | Configurable friction before app opens; no deceptive false enforcement | native QA |
| F11 | Schedules | Work/study/sleep hours with timezone/DST correctness and overrides | regression |
| F12 | Strict mode | Opt-in, bounded restrictions; emergency bypass, safe pause, obvious off switch; never lock out emergency services | manual regression |
| F13 | Selected apps | Install-state awareness, package allowlist, app picker as permitted; no misleading counts from activity switches | OEM regression |
| F14 | Adult domains | Optional DNS/VPN domain filtering if approved; clear limits, DNS failures/recovery and no history collection | security/policy/device |
| F15 | Shorts/Reels | Best-effort screen-level interruption only if UI detection proves reliable and store-compliant; unsupported versions explicitly marked | per-platform/version QA |
| F16 | AI content | Defer unverified cross-app image/reel classification; do not claim universal content modification | product truth check |
| F17 | Own Feed | Real finite licensed/allowed curated catalogue, selected categories, no infinite autoplay; hide/report/not interested | content QA |
| F18 | Home | Compact visual overview: installed/active protections, usage, goals, primary actions | UI QA |
| F19 | Challenges | Meaningful small actions, daily/week optional goals and evidence-bound copy | policy/test |
| F20 | Rewards | XP idempotent, never awarded twice for same day/action, no punishment for relapse or sexual behavior | unit tests |
| F21 | Streaks | Supportive consistency indicators, breaks do not erase permanently earned progress | unit tests |
| F22 | Insights | Transparent observed vs estimated data, private offline reports, timezone-safe day boundaries | unit tests |
| F23 | Leaderboards | Adult opt-in only, pseudonymous, positive activity aggregates (not intimate behavior), cheating defenses, full delete/opt-out | backend/privacy security |
| F24 | Family safeguards | No child online/social sharing until verified guardian flow and applicable policies implemented | legal/app-store gate |
| F25 | Calm | Breathing/reset, optional guided reflection, skip/restart, reduced motion | UX QA |
| F26 | Reliability | Offline behavior, reboot behavior, force-stop, battery saver, permission revocation, crashes and migrations | Android smoke suite |
| F27 | Data | Clear export/delete of stored data; encryption decisions and account/cloud deletion if accounts implemented | security QA |
| F28 | Disclosure | Accessibility and other powerful permissions documented with prominent in-app consent | Google Play policy |
| F29 | Build | Reproducible private QA APK, version code, install/upgrade/downgrade QA, no Play publish action | CI |
| F30 | Store | Accurate screenshots/claims, content rating/target age declarations, privacy policy, data safety, license/compliance, owner approval | launch gate |

## Feasibility truth boundaries
- UsageStats alone cannot actually block other applications.
- Accessibility can inspect limited app/window metadata only with consent. App/package opening restrictions are best-effort; background service interruptions vary by OEM and Android.
- Screen-level Reels detection is not guaranteed across all TikTok, Instagram and YouTube builds. JOY VIMO cannot alter those services' recommendation algorithms or guarantee removal of harmful video.
- Filtering all adult material inside third-party apps is not guaranteed by DNS-based website blocking.
- There is no medically established universal daily screen-time ceiling for adults. Presets are suggestions, not medical safety thresholds.
- No artificial "100% completed" claims, and no claims of working features before physical phone evidence.

## One consolidated tester handoff
Internal sequence: (1) scope and UI review (2) compile fixes (3) unit and instrumentation tests (4) device/emulator testing where feasible (5) release-candidate APK + clear enabled vs preview feature matrix (6) ONE guided Realme C71 video/screenshot/bug report covering all screens and selected apps (7) consolidated fixes in one next build (8) security/performance and store-policy gates (9) owner approval (10) Android Play release (11) iOS-specific implementation and certification.

## Launch blocker policy
A feature can be (A) implemented + device verified, (B) implemented but awaiting physical OEM verification, (C) visible preview and clearly labeled unavailable, or (D) deferred. No core promised safeguard may be claimed as live if category C or D. Owner decides whether to remove deferred features from the first public release.
