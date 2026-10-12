# JOY VIMO — Website Domain Rules (experimental Android milestone)

**Implementation status: Code integrated; manual QA APK compilation and Realme C71 verification pending. Not a released or proven blocker.**

## Scope
- Optional user-maintained list of up to 30 validated domain names (e.g. example.com), stored on the phone in JOY VIMO local state and native shared preferences.
- Dedicated consent switch for website-rule checking, **off by default**. Requires overall Focus Shield consent, active enforcement, and Android Accessibility enabled.
- Reads the Chrome address bar after navigation when available and compares the **current hostname only**. No URL history, URL text logging, screen recording, images, messages or password fields should be captured.
- Matching exact hostname or subdomain suffix (example.com or news.example.com; not notexample.com); on match it asks Android to navigate Back.
- The current implementation covers only Chrome on compatible layouts. Other browsers, incognito variants, in-app webviews, VPN bypasses, DNS-over-HTTPS paths, social feeds and media embedded inside other apps are **not** guaranteed blocked.
- Parent-supported under-13 mode cannot enable this experimental permission.
- An on-device service with `canRetrieveWindowContent=true` has OS capabilities broader than what code intends to read. Separate prominent disclosure, least-privilege audit and physical-device tests remain mandatory.

## Engineering
- Kotlin module: `modules/joy-vimo-usage/android/src/main/java/com/joyvimo/usage/JoyVimoFocusService.kt`
- Native validation/consent state: `JoyVimoUsageModule.kt`
- JS UI: `components/DomainRulesPanel.js` and `components/FocusControl.js`
- Input validation: `lib/domainRules.js`, `tests/domainRules.test.cjs`
- CI privacy gate: `scripts/privacy_preflight.py`; workflow remains manual-only.
- Local list is also included in Delete Local Data cleanup via JOY VIMO state and native config clear.
- Source was written for JOY VIMO after studying MIT-licensed open-source AppBlock/SelfLock patterns. No third-party code was copied into this milestone.

## Device acceptance tests (not yet run)
1. No consent => no Chrome interception; consent revoked => immediate stop.
2. No rule => ordinary Chrome browsing unaffected.
3. Valid matching host => Chrome navigates back; suffix hosts match correctly; unrelated lookalike domains do not.
4. URL typed but not navigated => not blocked or logged; Chrome version variation.
5. Phone lock/unlock, battery optimization and accessibility restart.
6. Rule edits apply while Focus Shield already active; delete local data resets native consent and list.
7. Under-13 local mode never activates.
8. False positives and safe offline/permission-revoked fallback.

**Privacy warning:** Any accessibility service that can retrieve window content is sensitive even if this implementation only reads Chrome's address-bar text. No claim of zero risk or universal filtering is authorized.
