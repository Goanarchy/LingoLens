# Market Research — Camera + Language Learning Apps

**Snapshot:** October 2026 · **Scope:** apps that identify objects with a camera or teach vocabulary, and what LingoLens can adopt while staying 100% free (no accounts, no keys, no subscriptions).

> Prices, tiers and store details change constantly. Treat vendor numbers as approximate and re-check before quoting them publicly.

---

## 1. Direct competitors (camera → object name)

| App | What it does | Free tier | Notes |
|---|---|---|---|
| **SnapWords** | Photo → object name + example sentence, 10+ languages | ~2 scans, then paywall | Small install base, high complaint volume about the limit |
| **CapWords** | Photo → object, AI definition, SRS review, 12+ languages | 2–5 scans, then subscription | Apple Design Award 2025; praised for polish, criticized for the early paywall |
| **PicWords / StickWords / CapWorld** | Clones of the above | Similar limits | Little differentiation |

**Key finding:** every direct competitor gates the core action (the scan) after a handful of uses. **None offers five languages at once for free, offline fallback and a local-first social layer.** That is LingoLens's wedge and must never be paywalled.

**Naming risk:** the name "LingoLens" is already used by several App Store apps, at least one of them camera→object→languages. If the app is ever published to a store, the name should be changed or qualified (e.g. "LingoLens: 5 Languages"). The GitHub repository can keep its name.

---

## 2. Adjacent apps worth learning from

### Identification apps

- **Google Lens** — zero onboarding, camera is the entry point, results are *actionable cards*, live translate overlay. No gamification, no saved vocabulary.
- **Google Translate (camera)** — offline language packs with visible size, freeze-frame mode, conversation mode. Proves that "download once, use offline" is a strong free feature.
- **Apple Visual Look Up** — on-device, confidence-gated categories, zero chrome. Hidden gesture is its main complaint.
- **PictureThis** — rich follow-up content (toxicity, care, diagnosis) but a credit-card trial that converts to a yearly plan. Its top review complaint is billing surprise, not accuracy.
- **Pl@ntNet** — free core, community verification, no ad wall.
- **Seek (iNaturalist)** — 100% free, no account, badges by taxonomy, seasonal challenges. Closest ethical model to LingoLens.
- **LeafSnap** — full-screen ad after each scan with a hard-to-dismiss close button. The canonical anti-pattern.

### Learning apps

- **Duolingo** — the retention benchmark: streak with freeze/repair, leagues, daily quests, mascot in notifications and widgets, notifications requested *after* the first lesson. Trade-off to avoid: leagues reward speed over learning.
- **Memrise** — native-speaker video, scenario decks. Complained about for showing locked lessons to free users.
- **Quizlet** — auto-generated cards and mastery insights, but the free tier now throttles core study.
- **Anki / AnkiDroid** — free, offline, FSRS scheduler, TTS, full backup. The proof that spaced repetition is what turns a collection into knowledge.

---

## 3. Feature matrix

| | Camera-first | Multi-language at once | Audio | Offline fallback | Gamification | Social | Onboarding | Model |
|---|---|---|---|---|---|---|---|---|
| Google Lens | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | none | free |
| Google Translate cam | ✅ | pair only | ✅ | ✅ packs | ❌ | ❌ | none | free |
| Apple Look Up | ✅ | ❌ | ❌ | ✅ on-device | ❌ | ❌ | none | free |
| PictureThis | ✅ | ❌ | partial | ❌ | light | ❌ | quiz + trial | paid trial |
| Pl@ntNet | ✅ | ❌ | ❌ | ❌ | light | community | minimal | free + premium |
| Seek | ✅ | ❌ | ❌ | partial | ✅ badges | ❌ | none | free |
| LeafSnap | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | minimal | ads + subs |
| Duolingo | ❌ | ❌ | ✅ | ✅ | ✅✅ | leagues | 8 steps | freemium |
| Anki | ❌ | ✅ | ✅ TTS | ✅✅ | ❌ | ❌ | none | free / OSS |
| SnapWords / CapWords | ✅ | ✅ | partial | ❌ | ❌ | ❌ | paywall-first | 2–5 scans |
| **LingoLens** | ✅ | ✅ **5 at once** | ✅ | ✅ catalog | ✅ | local | ❌ | free |

---

## 4. Gaps worth closing (ranked)

1. **No study loop.** Scanning without review is novelty. Add spaced repetition over your own scans.
2. **No retrieval practice.** Picture→word, word→picture and listen→spell drills turn the collection into skill.
3. **No first-run experience.** Competitors lose users at permission walls; a demo photo before the camera prompt fixes it.
4. **No safe return path.** A user-set, capped local reminder beats notification spam.
5. **No shareable artifact.** A word card is a free growth loop that needs no accounts.
6. **No sense of collection.** Grouping words by theme with mastery rings motivates more than raw XP.
7. **No pronunciation depth.** Slow/normal playback and syllable emphasis extend the app's existing edge.
8. **No data ownership.** Export/import and "delete everything" are trust signals for a no-account app.
9. **Accessibility debt.** Screen-reader labels, dynamic type and reduced motion are free to add and rarely done by competitors.
10. **No offline identification.** Real on-device labeling (ML Kit) cannot ship in Expo Go; the bundled catalog is the pragmatic substitute.

---

## 5. Anti-patterns to avoid

- Credit-card trials or auto-renewing plans.
- Paywalling the scan, the camera or the fifth language.
- Ads injected after an action, especially with fake close buttons.
- Showing locked content to free users.
- Punishing a broken streak; reminder spam; guilt-trip copy.
- Forced accounts for features that work locally.

**What respectful free apps do instead:** the core action is unlimited, reminders are opt-in and capped, permissions are requested in context, and monetization (if it ever exists) sells extras — never the core loop.

---

## 6. Technical constraints (Expo Go, SDK 58, Android)

Verified against the official docs:

| Capability | Available in Expo Go | Decision |
|---|---|---|
| Local database (`expo-sqlite`) | ✅ | Optional; AsyncStorage is enough for v1.1.0 |
| Local scheduled notifications | ✅ (local only) | Opt-in daily reminder |
| View → image + share (`react-native-view-shot` + `expo-sharing`) | ✅ | Shareable word card |
| SVG (`react-native-svg`) | ✅ | Mascot drawn in code, no binary assets |
| Animations (Reanimated 4 + worklets, Lottie) | ✅ | Mascot and micro-interactions |
| Haptics, localization, file system, document picker | ✅ | Polish and data ownership |
| `expo-speech` rate + voice selection | ✅ | Slow/normal pronunciation |
| Android home-screen widget | ❌ needs dev build | Out of scope |
| ML Kit on-device labeling/translation | ❌ needs dev build | Out of scope; keep the local catalog |
| Exact-time alarms on Android 12+ | ❌ needs manifest edit | Inexact daily reminder only |

---

## 7. Free assets and data

- **Mascot / illustration:** draw original SVG (preferred, zero licensing), or OpenMoji (CC BY-SA 4.0), Twemoji (CC BY 4.0), Kenney (CC0).
- **Icons:** Lucide (ISC), Phosphor (MIT).
- **Sound:** Kenney Audio (CC0).
- **Language data:** Wikidata / Wiktionary (CC0 / CC BY-SA), Open Multilingual WordNet (CC BY 3.0), Tatoeba (CC BY 2.0).
- **Fonts:** Atkinson Hyperlegible (OFL, accessibility), Inter (OFL).

---

## 8. Sources

- Google Lens — https://play.google.com/store/apps/details?id=com.google.ar.lens
- Google Translate offline camera — https://support.google.com/translate/answer/6142473
- Apple Visual Look Up — https://support.apple.com/en-us/104962
- PictureThis — https://apps.apple.com/us/app/picturethis-plant-identifier/id1252497129
- Pl@ntNet — https://play.google.com/store/apps/details?id=org.plantnet
- Seek — https://play.google.com/store/apps/details?id=org.inaturalist.seek
- LeafSnap — https://play.google.com/store/apps/details?id=plant.identification.snap
- Duolingo — https://play.google.com/store/apps/details?id=com.duolingo
- Memrise — https://play.google.com/store/apps/details?id=com.memrise.android.memrisecompanion
- Quizlet — https://play.google.com/store/apps/details?id=com.quizlet.quizletandroid
- AnkiDroid — https://github.com/ankidroid/Anki-Android
- SnapWords — https://play.google.com/store/apps/details?id=com.aiany.snapwords
- CapWords — https://apps.apple.com/us/app/capwords/id6738896465
- Expo SDK 58 — https://docs.expo.dev/versions/v58.0.0/
