# AGENTS.md — AI Agent & Multi-Model Context Guide for LingoLens

This is an **Expo SDK 58 + React Native 0.88.1 + TypeScript 6.0** mobile application (**LingoLens v2.0.0 · Google Pixel 9 Pro XL Edition**). Prioritize mobile-first patterns, 60fps performance inside **Expo Go**, and strict adherence to the project's established architecture.

> **Read First**: For the complete chronological history (`v1.0.0` → `v1.1.0` → `v2.0.0`), product requirements, and data contracts, read [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md).

---

## 1. Core Product Identity & Non-Negotiable Rules

1. **100% English Codebase & UI**: All source code, identifiers, UI copy, comments, documentation, and Git commit messages MUST be written strictly in **English**.
2. **Primary Target Hardware**: **Google Pixel 9 Pro XL** running **Expo Go** (Android 15/16).
   - Photos from the 50 MP sensor are downscaled to `1024px` (`0.72` JPEG quality) in `src/lib/image.ts` before cloud inference or storage.
   - Any optional native module not bundled in standard Expo Go MUST be guarded by `Constants.executionEnvironment !== 'storeClient'` (see `src/lib/speech-recognition.ts`).
3. **Immediate Camera Launch**:
   - The app opens directly onto the live Camera tab (`src/app/(tabs)/index.tsx`) and automatically requests camera permission on mount. Do NOT block startup with mandatory onboarding redirects (`onboarded` defaults to `true` in `src/store/useAppStore.ts`, while `/welcome` remains accessible from Settings).
4. **Dynamic 5-Language Polyglot Engine (`es`, `en`, `ja`, `hi`, `zh`)**:
   - Mandatory languages (`src/lib/languages.ts`): **Spanish (`es`), English (`en`), Japanese (`ja`), Hindi (`hi`), and Mandarin (`zh`)**.
   - Users can toggle **1 to 5 active languages** simultaneously (`learningLangs` in `useAppStore.ts`). If 1 is selected, show 1 card; if 3, show 3; if 5, show all 5.
   - Every `Translation` object (`src/lib/types.ts`) must include:
     - `word`: Native script (`manzana`, `apple`, `りんご`, `सेब`, `苹果`)
     - `romanization`: Latin transliteration (*Hepburn Rōmaji*, *ISO Transliteration*, *Hanyu Pinyin with tone marks*)
     - `phonetic`: Stressed-syllable phonetic guide (`/mahn-SAH-nah/`, `/reen-GOH/`, `/píng-guǒ/`)
   - Audio playback (`src/lib/tts.ts`) supports both normal speed (`0.85x`) and Duolingo-style slow turtle speed (`🐢 0.52x`).
5. **Duolingo-Style Pronunciation Coach (`src/lib/pronunciation-engine.ts`, `src/components/WordCard.tsx`)**:
   - Interactive voice/syllable validation beneath each `WordCard`.
   - Enforces a **`>= 75%` similarity threshold** (`PRONUNCIATION_PASS_THRESHOLD = 0.75`) and a **3-attempt limit** per session, plus a *"Can't speak now"* skip option.
   - **Strict Pedagogical Gate**: Pronunciation XP (`+15 XP`) and Gold Crown upgrades are awarded **only** when `passed === true`.
6. **Gamification: Daily Crowns, 1/2/3-Week Streaks & Merit Hub (`src/lib/gamification.ts`, `src/app/(tabs)/feed.tsx`, `src/app/(tabs)/profile.tsx`)**:
   - Photographing an object related to the **Word of the Day** (`getDailyWord()` / `evaluateDailyMatch()` in `src/lib/demoCatalog.ts`) awards `+25 XP` and unlocks a **Daily Photo Crown** (`Bronze` on photo match → `Silver` on saving word → `Gold` on passing pronunciation).
   - Consecutive daily photo streaks unlock **Week 1 (7d · `+100 XP` · Bronze Lens Crown)**, **Week 2 (14d · `+250 XP` · Silver Prism Trophy)**, and **Week 3 (21d · `+500 XP` · Golden Aperture Crown / Three-Week Dynasty)**.
   - **Merit Hub (`src/app/(tabs)/feed.tsx`)**: Social leaderboard (`MERIT_RIVALS` + current user) ranked by photo streak, crowns, and XP, with filters (`All Discoveries`, `👑 Crown Catches`, `🔥 7d+ Streaks`) and reactions (`🔥`, `💡`, `👑`).
7. **Mascot Evolution (`Kamu` — `src/lib/kamu.ts`, `src/components/Kamu.tsx`, `src/components/KamuBubble.tsx`)**:
   - **Lore (`KAMU_LORE`)**: One-Eyed Prism Chameleon hatched inside a Kyoto telephoto camera lens; shifts scale colors per language.
   - **8 Animated SVG Moods**: `idle`, `happy`, `excited`, `crowned`, `confused`, `sleepy`, `smug`, `wink` + optical aperture eye ring + golden crown crest.
   - **Contextual Guide & Photo Quips**: `KamuGuideBanner` appears across screens with tap-to-cycle tips and Lore modal; every analyzed photo displays a funny, object-specific remark (`result.kamuQuip`).

---

## 2. Commands & Validation

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm add — resolves SDK 58 compatible versions
npx expo start --lan        # Start the Metro bundler for Expo Go on local Wi-Fi
npx tsc --noEmit            # Run TypeScript compiler check (MUST return 0 errors)
npx expo lint               # Run ESLint check (MUST return 0 errors/warnings)
```

> **VPN / Multi-Adapter Note on Windows**: When a VPN adapter (e.g., `ProTUN` `10.2.0.2`) is active, set `REACT_NATIVE_PACKAGER_HOSTNAME=<Wi-Fi IPv4>` (e.g., `192.168.1.195`) when starting `npx expo start --lan` so the Google Pixel 9 Pro XL on Wi-Fi can reach Metro directly.

---

## 3. Architecture & File Map

- `src/app/_layout.tsx` — Root Stack navigator (`(tabs)`, `welcome`, `result`, `review`, `settings`).
- `src/app/(tabs)/_layout.tsx` — Bottom Tab navigator (`Camera`, `Library`, `Merit Hub`, `Profile`).
- `src/app/(tabs)/index.tsx` — Immediate Camera screen, Word of the Day Quest banner, live 1–5 language bar, and quick smart presets.
- `src/app/result.tsx` — Vision AI analysis, Word of the Day Crown banner, Kamu's Photo Critique (`kamuQuip`), dynamic 1–5 `WordCard` list, and reward modal.
- `src/app/(tabs)/feed.tsx` — Merit Hub social network, Hall of Fame leaderboard, filters, and reactions.
- `src/app/(tabs)/profile.tsx` — 1/2/3-Week Photo Streak Trophy Case (with `1W / 2W / 3W` simulator), Active Languages selector, Crowns Vault, 16 Badges, and Rank Path.
- `src/app/(tabs)/library.tsx` — Multi-script vocabulary search (`es`, `en`, `ja`, `hi`, `zh` + romanizations), category filters, and SRS entrypoint.
- `src/app/review.tsx` — SM-2-lite Spaced Repetition flashcard session.
- `src/app/settings.tsx` — Display name, 1–5 language selector, offline catalog toggle, Android TTS voice diagnostics, and Welcome Tour replay.
- `src/app/welcome.tsx` — 3-step interactive Kamu tour.
