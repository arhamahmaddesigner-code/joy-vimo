# JOY VIMO — Private-first OSS and release safeguards

Date: 2026-10-12. Development document. No public store release authorized.

## Owner workflow
- The owner wants **one consolidated Android APK review**, not repeated installs after each partial code edit.
- GitHub Actions Android QA workflow is now manual-only. Internal edits do not require owner actions.
- Do not ask for APK reinstall unless an integrated release candidate has passed code and privacy checks, compilation, and the known blockers below are explicitly resolved.
- No Google Play or iPhone launch until owner approves and real-device + compliance review is completed.

## Third-party open-source candidates (researched, NOT copied or integrated)
| Repository | License verified | Concept to evaluate | Risks/limits |
| --- | --- | --- | --- |
| EtashTyagi/SelfLock | MIT | App budget/schedules, device UX for permissions, website rules | Different standalone Kotlin app, browser URL inspection requires a distinct privacy disclosure |
| SadeekFarhan21/AppBlock | MIT | Local focus schedule, fast lock, stats | URL-bar access sensitive; strict mode must allow safety/recovery |
| mecrimino/Lor-Focus | MIT | Screen-level Shorts/Reels interruption, OEM diagnostics | View selectors break on third-party app updates; do not claim accurate content filtering |
| NewYearNewPhil/nothanks | MIT | Selective Shorts/Reels UX patterns | Described by author as primitive; reliability/regression testing needed |
| astraedus/nudge | GPL-3.0 | Progressive pause and mindful nudges (ideas only) | GPL source-distribution obligations if incorporating code |
| undisputedP/ShortsBlocker | GPL-3.0 per repository metadata/description; verify license file | DNS feed filtering concepts | Sensitive network behavior, app/domain compatibility, GPL obligations |
| kennethyork/Quiet | GPL-3.0 per GitHub API | Compare adult-domain filtering ideas | Must verify code behavior and dependencies separately |

MIT generally permits copying/modification/commercial use with required copyright and license notices. Other dependencies may have their own requirements. GPL code cannot be silently imported into a closed-source product without license obligations. No third-party source has been imported in this work. Public repositories are not automatically secure.

## Privacy engineering invariants
1. Opt-in separately for Usage Access, Accessibility, and any future VPN/DNS filtering. Make permissions revocable and keep user control. Never enable silently.
2. Accessibility service must not capture passwords, private messages, screen contents, screenshots, or content/images. Existing service observes target package names only; selective Reel detection would require new, openly disclosed metadata scanning and separate review.
3. Avoid collecting pornography viewing history, intimate habits, specific URLs, or sexual behavior. Keep self-reported progress private and positive.
4. Under-13 online accounts/monitoring/social features cannot launch before age-appropriate safety and parental compliance. The present local parent checkbox is NOT verifiable parental consent.
5. Android SharedPreferences and React Native AsyncStorage currently hold settings/check-ins locally. These should NOT be marketed as encrypted or fully secure. Review OS backups, encryption at rest for any sensitive data, device access and export/delete semantics before rollout.
6. Accessibility detection/background work needs Realme C71 and other OEM tests for false triggering, disabled permissions, force-stop, power optimization and reboot.
7. App timers and browser-domain filtering do not guarantee preventing explicit content inside Instagram, TikTok or every other platform.
8. Cloudflare Families Private DNS is optional manual configuration, not a built-in filtering service. A VPN may override it.
9. Maintain a functioning safety bypass/unlock option without deceptive or permanent lockouts.

## QA/signing BLOCKER
The current APK workflow generates a disposable debug signing key on fresh runners. It may generate APKs that cannot update prior APKs without uninstalling, risking loss of local progress. Do NOT request reinstall/uninstall until a stable private signing key (stored using encrypted GitHub Actions secrets, not committed to repository) or an approved migration/export solution is in place. CI compilation alone does not verify an installable upgrade path. Do not expose secret keys in logs.

## Private release gates
- Complete declared core-feature scope or explicitly mark and remove unsupported features; no mock success indicators.
- Static/privacy/license checklist plus node policy tests and native APK compile.
- OS-level permissions, app-open and session enforcement real-device QA.
- Device-safe release signing and data migration/backup procedure.
- Age/child privacy and behavioral-health claims review.
- Manual full owner review ONCE after internally validated candidate.

No clinical cure can be claimed. User improvement must be evaluated from real-life function and wellbeing, not a single streak count.
