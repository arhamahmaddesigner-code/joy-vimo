# JOY VIMO — Final integrated Android release gates

Status: **NOT YET COMPLETE**. Do not label any artifact final, or request owner install, until applicable gates pass.

## Implemented in source
- React Native/Expo mobile app, local guest onboarding, choices, goals and offline activity feed
- Native optional Accessibility Focus Shield, opening/time/session/overnight limits, mindful pause and safety bypass
- Experimental opt-in Chrome domain/YouTube Shorts/Instagram Reels/TikTok feed interruption
- Editable weekday schedules, reversible voluntary strict mode, Android diagnostics
- Private positive actions, XP, milestones, 7-day progress and guided support
- Opt-in adult leaderboard migration in supabase/migrations (schema only; NOT deployed)
- Manual-only QA APK workflow and static privacy preflight, Android no-backup plugin

## Unresolved blockers (must not disguise)
1. **Online backend:** No dedicated active JOY VIMO Supabase project exists. The only connected project is ORYX Development and is inactive; do not reuse, modify, or expose it without explicit permission. Separate organization/project/cost approval needed. Migration has not been executed. No live multiplayer leaderboard is available.
2. **Authentication and ranking:** Identity, region controls, privacy policy, age assurance, abuse/spam mitigation, moderation, opt-in/delete behavior and score authenticity need hardening and backend tests. Existing schema assumes adult self-declaration, which is not verified age assurance.
3. **Content:** Safe activities are offline and finite. Curated external streaming-video feed is NOT built; integrating live media requires licensed/approved sources, content moderation, child safety and privacy.
4. **Android:** Current source since the last successful Actions run has NOT been compiled. Accessibility UI heuristics, pause screen, night rollover, Chrome URL parsing, permission revocation, battery behavior and OEM restart need native compiler/test on Realme C71.
5. **Signing:** Current workflow creates a new disposable test certificate on GitHub runners, so installs may require uninstall and destroy local data. Dedicated stable private QA signing key must be securely created and put in Actions secrets (not source) and safe data export/migration reviewed.
6. **Security:** Repo's preflight is static, not a penetration test. Audit dependencies, permissions, data storage, no-backup behavior, native Accessibility APIs and app security before enabling real users.
7. **Release policy:** Play Store and App Store HOLD until explicit owner approval. Apps for children require verified safeguards; current local guardian acknowledgement does not suffice.

## What the owner asked for
ONE consolidated full-feature private Android APK, then ONE Realme C71 video review. No per-feature reinstall requests. Do not promise that this QA iteration is a medical cure, and do not shame someone for setbacks.

## Dependency order
Dedicated backend approval -> private opt-in auth/leaderboard integration -> genuine moderated content plan or transparently offline-only product -> reproducible Android static/unit/native build -> stable QA signing -> install/upgrade QA -> physical device review -> bug fixes -> owner-approved release.

## External data boundaries
Do not migrate existing ORYX Development financial/business data or services.
Never upload sexual or intimate browsing history, passwords, SMS, contacts, view text, video content or exact Chrome URLs.
