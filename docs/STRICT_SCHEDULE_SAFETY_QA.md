# JOY VIMO — Schedules, Commitment, and Safety (private Android)

Status: Source integrated on GitHub. **Not compiled in this turn and not tested on Realme C71.**

## New engineering work
- Editable start/end times (HH:MM), selectable weekdays, and overnight windows for Sleep, Study, Me time.
- Android native validates time and days and evaluates local wall-clock schedules, preserving earlier boolean presets.
- Emergency safety pause now governs not only app-opening/session caps but also Chrome-domain, Instagram/TikTok and YouTube interruptions.
- Optional 30-minute voluntary strict commitment. While active, changing protected rules/schedules is refused by Android and UI. The user can still disable enforcement, revoke permission, clear data or take an emergency safety pause; disabling resets the commitment.
- Unit assertions for daytime, weekdays, time boundaries and overnight windows in tests/scheduleRules.test.cjs; manual CI runs them.
- Privacy static preflight checks mandatory bypass and non-trapping rule design.

## Limits and high-priority test gaps
- The code was not rebuilt or installed during this step. GitHub manual-only APK build policy remains.
- Foreground detection and schedule checks depend on Android Accessibility and Realme OS background behavior. No accuracy guarantee yet.
- Android OS does not guarantee third-party activity launching reliably on all versions; opening delay may fail open.
- For the initial implementation strict mode protects the focus rules/schedules, **not uninstalling JOY VIMO or turning off Android Accessibility**. No permanent anti-disable traps are attempted.
- UI and native guard need real-device tests for race conditions and schedule transitions. Local device clock changes can affect wall-clock schedules.
- More acceptance testing is necessary for notification shade, lock screen, power saving, service restarts and night rollover.
- No other user's device data, intimate browsing history, messages, screenshots, videos or passwords should be logged or uploaded.
