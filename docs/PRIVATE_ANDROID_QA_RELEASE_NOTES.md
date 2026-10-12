# Personal Android candidate — build/install checklist

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
