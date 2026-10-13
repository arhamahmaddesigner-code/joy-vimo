# JOY VIMO — Final integrated Android release gates

Status: **NOT YET COMPLETE**. Do not label any artifact final, or request owner install, until applicable gates pass.

## Implemented in source
- React Native/Expo mobile app, local guest onboarding, choices, goals and offline activity feed
- Native optional Accessibility Focus Shield, opening/time/session/overnight limits, mindful pause and safety bypass
- Experimental opt-in Chrome domain/YouTube Shorts/Instagram Reels/TikTok feed interruption
- Editable weekday schedules, reversible voluntary strict mode, Android diagnostics
- Private positive actions, XP, milestones, 7-day progress and guided support
- Opt-in adult leaderboard migration in supabase/migrations (deployed only to dedicated JOY VIMO Supabase project)
- Manual-only QA APK workflow and static privacy preflight, Android no-backup plugin

## Verified status (2026-10-13)
1. **Backend isolated and deployed:** JOY VIMO has a separate Supabase organization and active dedicated project `hhrpwnsyfrdcrnusahkd` (Singapore). Adult leaderboard migration has been applied; both tables have RLS. Never touch ORYX Development.
2. **Native compilation:** GitHub internal compile run [38382511047](https://github.com/arhamahmaddesigner-code/joy-vimo/actions/runs/38382511047) **PASSED**, including unit/privacy checks. More recent weekly UI and YouTube Shorts heuristic changes are compiling in [38392213517](https://github.com/arhamahmaddesigner-code/joy-vimo/actions/runs/38392213517); do not assume this newer run succeeds until checked.
3. **Authentication, scores, and age:** Only database permissions/anonymous restrictions verified. Email OTP, 2+ real account isolation and cross-user RPC flows still require practical tests. Self-reported adult status is not age assurance; score claims remain self-reported and susceptible to scripted gaming. Security advisor's five authenticated SECURITY DEFINER RPC warnings need explicit capability review.
4. **Focus Shield:** Source includes consented native Accessibility, app/session/open limits, schedules, safe bypass and experimental selective feed/domain checks. OS/OEM behavior and website/video coverage require Realme C71 tests; no universal content filtering claim.
5. **Signing:** Owner-facing artifact upload is blocked unless stable signing credentials are provided as encrypted GitHub Secrets. Secrets are not present or verified through this connector. Internal compile APK is deliberately not distributed.
6. **Content:** Finite guided offline activities work in source; curated/licensed streaming video feed, moderation, creator permissions and age-suitable sourcing are **not yet implemented**.
7. **Design & release:** Premium screens/animations and full mobile accessibility regression remain. Under-13 online safeguards are not verified. No public Play Store/iOS publishing without owner approval.

## QA definition of done
- Latest main source compiles with CI unit/privacy checks; zero unexplained blockers.
- Positive and negative backend tests: anonymous blocked, own-row and other-user isolation, OTP verify, opt in, scores/daily cap, region/global sorting, opt out/delete, spam/abuse behavior.
- Realme C71 manual checklist includes all permissions, app/Shorts/Reels/TikTok/Chrome scenarios, keyguard, OS restart, background kills, strict schedules and emergency bypass.
- Only after stable protected QA keystore is configured, produce ONE consolidated privately signed review APK and record signing certificate fingerprint/versionCode to preserve safe upgrades.

## What the owner asked for
ONE consolidated full-feature private Android APK, then ONE Realme C71 video review. No per-feature reinstall requests. Do not promise that this QA iteration is a medical cure, and do not shame someone for setbacks.

## Dependency order
Dedicated backend approval -> private opt-in auth/leaderboard integration -> genuine moderated content plan or transparently offline-only product -> reproducible Android static/unit/native build -> stable QA signing -> install/upgrade QA -> physical device review -> bug fixes -> owner-approved release.

## External data boundaries
Do not migrate existing ORYX Development financial/business data or services.
Never upload sexual or intimate browsing history, passwords, SMS, contacts, view text, video content or exact Chrome URLs.


## 2026-10-13 JOY VIMO isolated backend verified
- Dedicated JOY VIMO Supabase project `hhrpwnsyfrdcrnusahkd` in separate JOY VIMO organization; status ACTIVE_HEALTHY, Singapore region.
- Adult leaderboard migration successfully deployed on this project only. Both leaderboard tables have RLS enabled.
- Public publishable client key/endpoint wired in `lib/joySupabase.js`. **Do not ever add service-role or secret credentials to the APK.**
- Supabase security advisor shows five expected authenticated-callable SECURITY DEFINER RPC warnings; review capabilities and guardrails before multiuser public release. RLS and permissions alone are not proof of safety.
- Email OTP delivery, live account flow, anonymous access resistance, cross-user data isolation, leaderboard calculations, age verification and client APK integration **not yet end-to-end tested**.
- ORYX Development database was not modified.
