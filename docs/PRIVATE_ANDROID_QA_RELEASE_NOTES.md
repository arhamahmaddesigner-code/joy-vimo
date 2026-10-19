# Personal Android candidate — build/install checklist

> Current evidence: [2026-10-19 repository audit](REPOSITORY_AUDIT_2026-10-19.md). Status entries below are historical; do not treat them as current completion proof.
## Current scope (October 2026)
- Optional Focus Shield using Android Accessibility package/window metadata, daily opening caps, daily minutes, current-session checks and preset schedule windows; requires explicit consent and system permission. Realme C71 reliability **not yet verified**.
- Android Usage Access local app timing readings; does not read browser or app screen content.
- System Private DNS guide for family.cloudflare-dns.com (opt-in, best-effort adult-domain blocking only; never guaranteed to block individual Reels).
- Private Support Space: non-judgmental 4-step urge reset, 60-second breathing, 5-step personal plan, weekly positive-action review. Stored locally; erasure option included.
- Basic challenges, XP, rewards, age-sensitive local onboarding, sample finite Joy Feed.
- No live personal cloud profile, curated real video backend, public leaderboard, verified Shorts detector or built-in DNS/VPN service.

## Critical installation warning
The current GitHub QA workflow creates a **new disposable Android debug signing key** on each build. An APK from one build may fail to update another with 'App not installed / conflicting package'. Do not claim seamless in-place upgrades or tell the owner to uninstall without warning about locally stored progress. Before repeated user-facing QA, configure a stable and securely stored QA signing key through a protected CI secret or implement a safe migration/export path. Never commit a private signing key to source control.

## Verification required
1. CI JavaScript/policy checks and native Gradle APK compilation.
2. Install/upgrade signing verification on the Realme C71 with explicit backup precautions.
3. Explicit consent, accessible permission status, revocation, no browser content/URL collection.
4. Test 1, 3, 5 opening caps across home/lock/unlock and app relaunches; time caps, session checks and schedule timezone transitions.
5. Check OEM background restrictions, battery usage, crash/log loops, accessibility-service restart and Android reboot.
6. Test ability to disable protection at any time, and local data erasure.
7. Test family DNS using a harmless documented test domain if available and confirm normal internet still works. Do not ask to visit explicit sites.
8. Test private support and reward data persistence, independent of any public profile.
9. Security, privacy, user-facing accessibility and Play Store eligibility separately. Under-13 use requires verified compliance strategy if public launch includes children.

## Product truth
This is an evolving private QA candidate, not a completed clinical treatment or certified porn-blocker. It cannot detect harmful content within every third-party social feed. There is no guaranteed symptom cure or medically universal 'safe' daily screen-time limit.

## Consolidated owner QA handoff prerequisites (2026-10-14)
- Latest successful internal Android source compilation is not proof of physical-device functionality.
- Owner-facing private APK requires four protected GitHub Actions secrets: `JOY_QA_KEYSTORE_BASE64`, `JOY_QA_STORE_PASSWORD`, `JOY_QA_KEY_ALIAS`, `JOY_QA_KEY_PASSWORD`. Do not paste any of these into chat or commit them.
- Preserve the same keystore for future APK updates. Build workflow verifies APK signature, records certificate fingerprint and SHA-256 in restricted workflow logs before uploading the artifact.
- Verify signed build on Realme C71: install/upgrade without data loss; three-denial cooldown and safety pause; device reboot/battery restrictions; consent and permissions; local export/erase; Joy Feed/companion/challenges at different font sizes.
- Third-party entertainment video licensing, live authentication/backend security, and age-specific launch compliance remain separate blockers. Do not label the APK a finished public product.

