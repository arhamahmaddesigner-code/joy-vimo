# JOY VIMO

An early-stage, Android-first digital wellbeing experiment built with React Native, Expo and optional native Android capabilities. Its goal is to help people choose focus, offline breaks and more intentional screen time, without shame or invasive monitoring.

**Project status:** Actively developed, **not production-ready**. This repository may be opened to the community after a privacy and security review. There are no claimed public downloads, external contributors or production deployments. A successful internal Android compile is not proof of physical device behavior.

## Current source

- Local goals, voluntary focus plans, personal XP/progress and finite offline activities, including Memory Garden
- Opt-in Android usage/Accessibility-based focus tools with safe stop and emergency pause controls
- Experimental Chrome website and selective short-form feed interruptions; coverage varies by app/version and is not guaranteed
- Local, reversible Joy Feed preferences, local-only flags, private data export and on-device erase controls
- Optional, **adult-only**, explicitly opt-in Supabase leaderboard (requires secure backend configuration and live authorization tests)
- An opt-in video-player interface that only accepts entries flagged as licensed and age-reviewed; **no approved video catalogue is included**
- Daily reminders, responsive layout helpers and native Android integration tests

The app is **not** a medical treatment or guaranteed content blocker. Child/teen access to public rankings remains disabled. Any third-party service must be configured and reviewed independently.

## Getting started

Prerequisites: Node.js and the Android/Expo SDK required by the project's current Expo version.

```bash
npm ci
npm test
npm run check:syntax
npx expo start
```

For a native Android development build, use the repository's Expo/Android workflow. Internal Android integration Actions intentionally do **not** upload user-installable APKs.

## Privacy and security

Do not commit passwords, access tokens, Android signing material, database service-role keys, private user data or production credentials. A Supabase **publishable client key**, if present, is not a service-role key. Its presence does **not** imply that the live backend is safe: RLS, function grants, rate limits and cross-account behavior require separate verification.

The privately signed owner-review APK is gated by explicit release readiness checks and protected signing secrets. The repository is not permission to access its maintainers' GitHub account, other private repositories or production systems.

**Before changing repository visibility:** Review the entire Git history (including author email addresses), old GitHub Actions logs and any previously exposed data, and independently verify the live backend. Changing from private to public can make that history visible.

## Contributing

Bug reports, privacy improvements, tests, documentation fixes and appropriately scoped contributions are welcome once the repository is public. For security-sensitive findings, do not post credentials or personal data in public issues.

This is an early-stage project; it does **not** yet have a measured downstream dependency ecosystem. Avoid claiming production adoption or user counts without evidence.

## License

Original JOY VIMO source files are offered under the [MIT License](LICENSE). Third-party libraries and assets remain subject to their respective licenses. The JOY VIMO name and visual identity are not separately granted as trademarks.
