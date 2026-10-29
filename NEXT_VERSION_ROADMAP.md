# Next Version — Roadmap & Backlog

**LingoLens — One photo, five languages**

Current release: **v1.1.0 "Learning Loop"**. This document tracks what shipped and what comes next.

Scope and version number are decided together:

- **PATCH (1.0.x):** fixes only, no new features.
- **MINOR (1.1.0):** batch of compatible features.
- **MAJOR (2.0.0):** architecture or experience change (real backend, redesign, new modes).

Market context and competitor analysis: [MARKET_RESEARCH.md](./MARKET_RESEARCH.md).

---

## v1.1.0 — "Learning Loop" (shipped)

The research is consistent: identifying objects is the hook, but **retention comes from reviewing what you collected**. Every direct competitor paywalls the scan after 2–5 uses; LingoLens keeps it unlimited and free, and wins on practice, personality and polish.

### Wave 1 — Shipped in v1.1.0

| # | Feature | Why | Free / Expo Go implementation |
|---|---|---|---|
| W1 | **First-run intro** (3 screens + demo scan before the camera permission) | Competitors lose users at permission and paywall walls | Static onboarding route, `expo-localization` for the default language, local flag in the store |
| W2 | **Original mascot** drawn in code | Duolingo proves personality drives return; no licensing cost | `react-native-svg` + Reanimated 4; zero binary assets |
| W3 | **Library with search, filters and favorites** | A collection you cannot search is not a collection | New `/library` route over the existing `learned` array |
| W4 | **Spaced-repetition review (flashcards)** | Turns scanning into retention | Local scheduler (SM-2-lite) in `lib/srs.ts`; 3 grade buttons; XP and streak-safe |
| W5 | **Shareable word card** | Free growth loop, no accounts | `react-native-view-shot` + `expo-sharing` (both in Expo Go) |
| W6 | **Daily word + haptics** | Gives the camera a reason today; tactile feedback | Deterministic local pick from the catalog, `expo-haptics` |
| W7 | **Accessibility pass** | Rare in this category, free to add | Accessibility labels, dynamic type, reduced-motion support |
| W8 | **CI + tests** | Keeps the repo trustworthy | GitHub Actions (`tsc`, lint, doctor) + Jest for XP/ranks/SRS — **not shipped in 1.1.0**; planned for 1.2.0 |

### Wave 2 — v1.2.0 candidates

- Pronunciation coach: slow/normal playback, syllable emphasis, record-and-compare (`expo-audio`).
- Opt-in local daily reminder (`expo-notifications`, local only, capped, quiet hours).
- Export/import progress (`expo-file-system` + `expo-document-picker` + `expo-sharing`).
- Brand identity: final icon and splash.
- Language selection from 2 to 10.
- Themed weekly scan challenges.

### Wave 3 — v2.0.0 candidates

- Shared feed with a real backend (Supabase free tier, anonymous auth).
- Server-side XP validation and moderation.
- Signed APK/AAB via EAS Build.

### Not possible in Expo Go (documented, not bugs)

- Android home-screen widget — requires a development build.
- On-device ML Kit labeling/translation — requires a development build.
- Exact-time alarms on Android 12+ — requires a manifest change.

---

## Naming

Several App Store apps already use "LingoLens", at least one with the same camera→object→languages concept. Before any store submission the name should be changed or qualified; the GitHub repository can keep its current name meanwhile.

---

## Version criteria

| Scope | Version |
|---|---|
| Fixes for 1.0.0 only | 1.0.1 |
| Wave 1 (intro, mascot, library, review, share, daily word, accessibility) | 1.1.0 |
| Wave 1 + Wave 2 | 1.2.0 |
| Includes Wave 3 (backend) | 2.0.0 |
