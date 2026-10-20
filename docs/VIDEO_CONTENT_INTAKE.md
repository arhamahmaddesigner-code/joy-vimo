# Curated video intake and acceptance

The production catalogue is empty. Tests contain fictional metadata only; they grant no rights and must never become catalogue entries.

For each proposed 5–180 second video, supply the asset, creator/rights holder, documentary permission URL, required attribution wording, and a named human rights/content reviewer. The permission must cover in-app streaming, commercial use and worldwide availability: this app has no geographic access control. Include music, people and third-party material in the review; a publicly reachable URL alone is not a licence.

The reviewer supplies `reviewedAt` and `rightsValidUntil` as real `YYYY-MM-DD` dates. The latter is inclusive through that date in UTC. `appStreamingAllowed` and `commercialUseAllowed` must both be true, `territory` must be `worldwide`, and `attributionText` must contain the credit required by the permission. The validator rejects missing or expired rights, invalid calendar dates, future reviews and any `approvalState` except `approved`.

Each entry also needs a unique ID, title, topic, all/teen/adult rating, duration, direct HTTPS media URL and supporting evidence URL. Tokens/query parameters in URLs are currently unsupported. Keep private contracts and personal data out of this public repository; use an appropriate shareable evidence summary or authorized reference.

Before approving a real entry:

- Watch the entire asset, review sound/music and age suitability, and check the exact file against the permission and attribution.
- Verify playback, loading/error/retry, manual start, background pause, close, orientation and accessibility on Android.
- Verify local hide/feedback persists after restart, restore and clear work, and erase/export include the existing shared feed preference keys. Feedback is device-only and is not a moderation report.
- Verify an expired/revoked entry cannot be selected and active playback closes at expiry. Expiry uses the device clock and refreshes on foreground. Earlier revocation of this bundled catalogue requires an app update; there is no remote takedown service. Agree the operational revocation plan before release.

Automated metadata validation does not establish legal ownership or human age suitability. Keep the rights release flag false until documentary review and real-asset Android QA are recorded.
