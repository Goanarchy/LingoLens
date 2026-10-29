# Next Version — Roadmap & Backlog (v1.1.0)

**LingoLens — One photo, five languages**

This document lists candidate improvements for the next release. The version number is assigned based on the final scope:

- **PATCH (1.0.x):** fixes only, no new features.
- **MINOR (1.1.0):** batch of backwards-compatible features and improvements.
- **MAJOR (2.0.0):** deep architecture or experience change (real backend, redesign, new modes).

---

## Proposed improvements

### P1 · Discovery history and search
**Impact:** high · **Effort:** medium

- Screen with every saved word: object, emoji, category, date and the 5 languages.
- Text search plus filtering by language/category.
- Play audio from the history and mark favorites.
- Clear history with confirmation.

### P2 · Brand identity (icon, splash and store assets)
**Impact:** high · **Effort:** low

- Final icon (lens + language bubble) in every Android/iOS size.
- Splash screen consistent with the brand.
- Store listing: name, short description and screenshots for a future release.

### P3 · Daily review with flashcards
**Impact:** high · **Effort:** high

- Review session using saved words (5, 10 or 15 cards).
- Simple spaced repetition: "again", "good", "easy".
- Bonus XP and streak when the review is completed.
- Summary with correct answers and words to reinforce.

### P4 · Share card as an image
**Impact:** high · **Effort:** medium

- Generate a polished image with the photo, the object and the 5 languages.
- Share via WhatsApp, Instagram or save to the gallery.
- Requires `expo-sharing` plus view capture; validate Expo Go compatibility.

### P5 · Onboarding and explained permissions
**Impact:** medium · **Effort:** low

- 3 intro screens: what it does, how to scan and privacy.
- Explanation before the camera permission plus a "try a sample photo" button.
- Shown only the first time, with a skip option.

### P6 · Language selection (2 to 10)
**Impact:** medium · **Effort:** medium

- Choose active languages in Settings; the app adapts to that list.
- Per-language ranks only for active languages.
- Validate the AI prompt with variable lists.

### P7 · Export and import progress
**Impact:** medium · **Effort:** low

- Export words, XP, badges and posts to a JSON file.
- Import on another phone to keep your progress.
- Requires `expo-file-system` and `expo-sharing`.

### P8 · Quality and repository CI
**Impact:** medium · **Effort:** medium

- GitHub Actions: `tsc`, `expo lint` and `expo-doctor` on every push.
- Unit tests for gamification (XP, ranks, badges) and AI normalization.
- Issue and pull request templates.

### P9 · Shared feed with a real backend (v2.0.0 candidate)
**Impact:** very high · **Effort:** very high

- Supabase (free tier): anonymous auth, posts table, likes and image storage.
- Basic moderation and posting limits.
- Replaces the local feed; keeps offline mode.

---

## Version criteria

| Scope | Version |
|---|---|
| Fixes for 1.0.0 only | 1.0.1 |
| P1 + P2 + P5 + P8 (recommended batch) | 1.1.0 |
| P1 + P2 + P3 + P4 + P5 | 1.1.0 |
| Includes P9 (backend) | 2.0.0 |
