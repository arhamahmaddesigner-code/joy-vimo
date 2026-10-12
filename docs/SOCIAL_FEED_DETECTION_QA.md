# Instagram Reels & TikTok feed interruption — private QA

Status: **source integrated on GitHub, not compiled or tested on Realme C71**. Do not market as confirmed working.

## Implemented in code
- Dedicated switches for Instagram Reels and TikTok For You; both off by default.
- Each switch requires user opt-in, active overall Focus Shield, and Android Accessibility permission.
- Native Accessibility checks select foreground package name, a small set of candidate Android view resource IDs and minimum fullscreen view geometry. Screen text, video pixels, messages and content descriptions are not deliberately read.
- If a high-confidence supported-screen match occurs, native code attempts Back. False negatives are expected on unsupported versions.
- Consent state is stored on the device. Disabling overall Focus Shield prevents feed interruption.
- Preference sync preserves independently chosen switches when app and domain limits change.
- Privacy preflight now checks the opt-in UI and native detection shape.

## Unverified / limitations
- The candidate IDs are heuristics. **No evidence yet that they match current Instagram or TikTok layouts on the Realme C71.** TikTok's For You view may cover much of TikTok; screen-level blocking may interfere with legitimate use.
- This cannot detect, classify or filter pornography in arbitrary videos. No altered third-party feed algorithms or guaranteed blocker.
- Android Accessibility with `canRetrieveWindowContent=true` is a sensitive permission even if our code intends to read only UI IDs and Chrome hostnames.
- Full native build, accessibility consent flow, unit tests, on-device smoke tests, accuracy, false-positive rate and battery review are still required.
- Do not import third-party GPL source without legal review and source-distribution compliance.

## Acceptance before exposing as production functionality
1. Consent OFF: no interception.
2. Enable/disable Instagram and TikTok independently.
3. Unsupported layouts fail open instead of locking whole social apps.
4. Confirm direct messages and regular posts remain usable for the user's chosen mode.
5. Revoke Accessibility and verify immediate cessation; restart/reboot checks.
6. Check device versions and permitted Android Accessibility uses against Google Play policy.
7. Privacy audit for no sensitive UI data logging/transmission.

## Workflow
Per owner instruction the repository uses **manual-only APK builds**. Do not request a new installation for this isolated engineering step. Integrate all remaining features first and deliver one consolidated Android QA candidate.
