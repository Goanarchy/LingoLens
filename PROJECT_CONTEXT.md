# LingoLens — Comprehensive Project Context & Evolution History (`PROJECT_CONTEXT.md`)

> **Purpose of this document**: This file is the single source of truth for **LingoLens** ("Lingo Leans"), documenting every user request, architectural decision, data model, gamification rule, hardware optimization, and testing instruction from its initial creation (`v1.0.0`) through the `v1.1.0` learning loop and the `v2.0.0` 5-Agent upgrade for the **Google Pixel 9 Pro XL**. Any future AI model or engineer working on this repository should read this file and [`AGENTS.md`](./AGENTS.md) first.

---

## 1. Executive Summary & Core Vision

- **Application Name**: **LingoLens** (also referenced in prompts as *Lingo Leans*)
- **Repository**: `https://github.com/Goanarchy/LingoLens.git` (branch: `main`)
- **Primary Target Hardware & Runtime**:
  - **Device**: **Google Pixel 9 Pro XL** (Android 15/16, 20:9 high-density OLED display, 50 MP main camera sensor, Google TTS & Speech Services).
  - **Development / Testing Runtime**: **Expo Go** (Expo SDK 58, React Native `0.88.1`, React `19.3.0`, TypeScript `6.0.3`).
- **Core Product Vibe**: *"A rewarding gamified system for catching great daily photos and mastering world languages with them."*
- **Mandatory Codebase Language Rule**: **100% of source code, variable names, UI copy, technical comments, documentation, and Git commits inside the repository MUST be written strictly in English.**

---

## 2. Complete Chronological History (What Was Requested & What Was Built)

### Stage 1 — Initial Creation (`v1.0.0`)
- **What was requested**:
  - Create a mobile app that uses the phone camera to identify everyday objects and translate them into 5 languages with native pronunciation audio, XP progression, and a community feed, operating 100% free without paid API keys or user registration.
- **What was achieved**:
  - Built the initial Expo SDK 58 + Expo Router architecture (`src/app/`, `src/components/`, `src/lib/`, `src/store/`).
  - Implemented keyless cloud vision cascade (`Qwen2.5-VL-72B-Instruct` via OVHcloud AI Endpoints) paired with an offline local catalog so the app never fails when offline or rate-limited.
  - Added on-device image downscaling (`MAX_IMAGE_EDGE = 1024`, JPEG quality `0.72` in `src/lib/image.ts`) to prevent 50 MP camera captures from exhausting memory in Expo Go.
  - Created persisted Zustand state (`AsyncStorage`) for XP, learned words, badges, and local community posts.

### Stage 2 — Retention & Learning Loop (`v1.1.0`)
- **What was requested**:
  - Benchmark LingoLens against top camera/language apps (Google Lens, Duolingo, Anki, CapWords, Seek) and close the retention gaps while staying 100% free and Expo Go compatible.
- **What was achieved**:
  - **Kamu Mascot (v1)**: Original code-drawn SVG chameleon (`react-native-svg`) with zero binary image bloat.
  - **Searchable Library (`/library`)**: Search across languages, category filter chips, and favorites (`★`).
  - **Spaced-Repetition Flashcards (`/review`, `src/lib/srs.ts`)**: SM-2-lite scheduler with *Again / Good / Easy* grading and XP rewards.
  - **Collectible Share Card (`src/components/ShareCard.tsx`)**: Offscreen `1080×1350` PNG card capture via `react-native-view-shot` + `expo-sharing`.
  - **Market Research & Roadmap Docs**: Documented competitor analysis in `MARKET_RESEARCH.md` and `NEXT_VERSION_ROADMAP.md`.

### Stage 3 — Multi-Agent Scaling & Google Pixel 9 Pro XL Upgrade (`v2.0.0`)
- **What was requested (5-Agent System Prompt)**:
  1. **Agent 1 (Lead Architect & Researcher)**: Audit repository architecture and optimize vision AI + camera pipeline specifically for the **Google Pixel 9 Pro XL** running **Expo Go**, linking photo analysis with the **"Word of the Day"**.
  2. **Agent 2 (Frontend & Mobile Engineer — Core UX, Camera & Pronunciation)**:
     - **Immediate Camera Launch**: Opening the app must activate the camera immediately (`src/app/(tabs)/index.tsx`), ready to capture a photo right away.
     - **Dynamic 5-Language Support**: Support **Spanish (`es`), English (`en`), Japanese (`ja`), Hindi (`hi`), and Mandarin (`zh`)**. Display cards dynamically based on the user's selection (1 language → 1 card; 3 languages → 3 simultaneous cards; 5 languages → 5 simultaneous cards). Each card must show the **translated word in native script**, **romanization**, and **phonetic pronunciation**.
     - **Duolingo-Style Pronunciation Module**: Interactive voice test beneath the results. Award pronunciation points **only** when the system validates that pronunciation is accurate.
  3. **Agent 3 (Product Designer & Gamification Expert — Crowns, Streaks & Merit Social Network)**:
     - Award points and **Daily Photo Crowns** when the user photographs an object related to the **"Word of the Day"**.
     - Implement special unlockable rewards and trophies for **1 full week (7 days)**, **2 weeks (14 days)**, and **3 weeks (21 days)** of consecutive daily photos.
     - Build a **Merit Social Network** focused on rewarding long photo streaks, crowns, and high ranks.
  4. **Agent 4 (UI/UX & Character Designer — Mascot Evolution)**:
     - Give **Kamu** a solid backstory (`KAMU_LORE`), upgraded visual design, fluid animations/moods, interactive guide banners across screens, and a dynamic system of **witty, funny comments specific to the exact photo just taken (`kamuQuip`)**.
  5. **Agent 5 (DevOps & QA Engineer)**:
     - Ensure 100% fluidity on **Google Pixel 9 Pro XL** with **Expo Go**, unify the entire repository in **100% English**, verify zero TypeScript/lint errors, synchronize with GitHub, and prepare live Expo Go QR testing.

- **What was achieved in `v2.0.0`**:
  - **Immediate Camera Viewfinder (`src/app/(tabs)/index.tsx`, `src/app/(tabs)/_layout.tsx`)**:
    - App opens directly onto the `Camera` tab (`onboarded` defaults to `true`) and auto-requests camera permission via `useEffect`.
    - Includes top HUD (`🔥 Photo Streak`, `👑 Crowns`), interactive **Word of the Day Quest** banner with native TTS preview, live **1-to-5 Language Toggle Bar**, and **Quick Smart Presets** (*Auto Vision AI*, *Today's Quest*, and catalog objects) for instant testing in Expo Go.
  - **5-Script Dynamic Polyglot Engine (`src/lib/languages.ts`, `src/lib/demoCatalog.ts`, `src/lib/vision.ts`)**:
    - Replaced Western-European-only defaults with the 5 mandatory global languages covering 4 distinct writing systems:
      - 🇪🇸 **Spanish (`es-ES`)** — Latin script
      - 🇺🇸 **English (`en-US`)** — Latin script
      - 🇯🇵 **Japanese (`ja-JP`)** — Kanji/Kana + **Hepburn Rōmaji**
      - 🇮🇳 **Hindi (`hi-IN`)** — Devanagari (`देवनागरी`) + **ISO Transliteration**
      - 🇨🇳 **Mandarin (`zh-CN`)** — Simplified Hanzi (`简体中文`) + **Hanyu Pinyin with tone marks**
    - Expanded `CATALOG` in `src/lib/demoCatalog.ts` to **24 everyday photographable objects** (`apple`, `coffee`, `cup`, `book`, `chair`, `table`, `dog`, `cat`, `phone`, `laptop`, `key`, `clock`, `shoe`, `flower`, `bottle`, `car`, `water`, `window`, `glasses`, `pen`, `backpack`, `headphones`, `bread`, `tree`), each with native scripts, romanizations, phonetic guides, example sentences + English translations, semantic aliases for daily matching, and 3 object-specific Kamu quips.
  - **Duolingo-Style Pronunciation Coach (`src/lib/pronunciation-engine.ts`, `src/lib/speech-recognition.ts`, `src/components/WordCard.tsx`)**:
    - Normalizes Unicode (`NFKC`/`NFD`), strips tone marks/diacritics, and computes normalized Levenshtein similarity + syllable hit ratio against native script, romanization, and phonetic representation.
    - Enforces `PRONUNCIATION_PASS_THRESHOLD = 0.75` (75%), maximum 3 attempts per card, syllable-by-syllable green/amber highlighting, normal (`🔊 0.85x`) and slow turtle (`🐢 0.52x`) TTS playback, and a *"Can't speak now"* skip button.
    - Guarded native ASR with `Constants.executionEnvironment !== 'storeClient'` so **Expo Go** never triggers native module warnings, seamlessly running the interactive Hold-to-Speak cadence + phonetic syllable verifier in Expo Go.
  - **Crowns, 1/2/3-Week Streak Trophies & Merit Hub (`src/lib/gamification.ts`, `src/store/useAppStore.ts`, `src/app/(tabs)/feed.tsx`, `src/app/(tabs)/profile.tsx`)**:
    - **Daily Photo Crowns**: `Bronze` (`+25 XP` on photographing the Word of the Day) → `Silver` (on saving word) → `Gold` (on passing pronunciation).
    - **Weekly Streak Milestones (`STREAK_MILESTONES`)**:
      - `streak_week_1` (7 days): `🥉 Week 1 · Bronze Lens Crown` (`+100 XP`, title: *Shutter Sprinter*)
      - `streak_week_2` (14 days): `🥈 Week 2 · Silver Prism Trophy` (`+250 XP`, title: *Fortnight Focus Master*)
      - `streak_week_3` (21 days): `👑 Week 3 · Golden Aperture Crown` (`+500 XP`, title: *Three-Week Dynasty*)
    - Added instant test buttons (`🔥 1W (7d)`, `🔥 2W (14d)`, `🔥 3W (21d)`) in `src/app/(tabs)/profile.tsx` (`simulateStreakMilestone`) so testers on Pixel 9 Pro XL can verify all 3 weekly reward tiers immediately.
    - Built the **Merit Hub (`src/app/(tabs)/feed.tsx`)** featuring the **Merit & Streak Hall of Fame** leaderboard (`MERIT_RIVALS` + user), filter tabs (`All Discoveries`, `👑 Crown Catches`, `🔥 7d+ Streaks`), and interactive reactions (`🔥`, `💡`, `👑`).
  - **Kamu Mascot Evolution (`src/lib/kamu.ts`, `src/components/Kamu.tsx`, `src/components/KamuBubble.tsx`)**:
    - Added `KAMU_LORE` (origin in Kyoto Optical Lab Periscope Lens Chamber #09, motto, chromatic scale shifting).
    - Upgraded `Kamu.tsx` with 8 moods (`idle`, `happy`, `excited`, `crowned`, `confused`, `sleepy`, `smug`, `wink`), golden royal crown SVG polygon, and optical aperture ring.
    - Added `KamuGuideBanner` with tap-to-cycle screen tips and full Lore modal across Camera, Library, Merit Hub, and Profile.
    - Added **Kamu's Photo Critique** card on `src/app/result.tsx` displaying `result.kamuQuip` for every photo.

---

## 3. Complete Architecture & File Reference

| File Path | Role & Responsibility |
|---|---|
| `app.json` | Expo SDK 58 configuration (`v2.0.0`, dark UI, English camera & photo permissions). |
| `package.json` | Dependencies (`expo ~58.0.21`, `react-native 0.88.1`, `zustand ^5.0.16`, `react-native-svg`, etc.). |
| `AGENTS.md` | Fast-load operational rules and commands for AI coding agents. |
| `PROJECT_CONTEXT.md` | Complete historical & architectural context (this file). |
| `NEXT_VERSION_ROADMAP.md` | Release history (`v1.0.0` → `v1.1.0` → `v2.0.0`) and `v2.1.0+` backlog. |
| `START_HERE_USER_GUIDE.md` | Step-by-step user & tester manual for Google Pixel 9 Pro XL + Expo Go. |
| `src/lib/languages.ts` | Defines `LangCode` (`'es' \| 'en' \| 'ja' \| 'hi' \| 'zh'`), `LANGUAGES`, `sanitizeLangs`, and `usesNonLatinScript`. |
| `src/lib/types.ts` | Central TypeScript contracts (`Translation`, `DailyMatch`, `ScanResult`, `CrownRecord`, `Post`, `Stats`, `PhotoOutcome`, `PronunciationOutcome`). |
| `src/lib/demoCatalog.ts` | 24-object offline polyglot dictionary, `getDailyWord()`, `evaluateDailyMatch()`, and object-specific `kamuQuips`. |
| `src/lib/vision.ts` | Keyless hybrid vision engine (`identifyObject`, `filterScanTranslations`) with cloud cascade + local catalog fallback. |
| `src/lib/image.ts` | `prepareImage()` — downscales 50 MP Pixel 9 Pro XL photos to `1024px` JPEG (`0.72`) with `capturedAt` ISO timestamp. |
| `src/lib/tts.ts` | `speakWord()` (normal `0.85x` and slow `0.52x` speeds) and `getVoiceStatus()` for all 5 languages. |
| `src/lib/speech-recognition.ts` | `comparePronunciation()`, `recognizeSpeech()`, and Expo Go `storeClient` guard. |
| `src/lib/pronunciation-engine.ts` | 3-attempt Duolingo session manager, `evaluateSingleAttempt()`, and `buildPhoneticChoices()`. |
| `src/lib/gamification.ts` | `RANKS` (7 tiers), `LANG_RANKS`, `STREAK_MILESTONES` (Weeks 1, 2, 3), and `BADGES` (16 badges). |
| `src/lib/kamu.ts` | `KAMU_LORE`, `KAMU_LANG_COLORS`, `KAMU_SCREEN_TIPS`, and `getPhotoQuip()`. |
| `src/lib/srs.ts` | SM-2-lite spaced repetition scheduler (`gradeReview`, `buildSession`, `countDue`). |
| `src/data/seed.ts` | `MERIT_RIVALS` leaderboard peers and `seedPosts()` with merit metadata and reactions. |
| `src/store/useAppStore.ts` | Persisted Zustand store (`lingolens-v2`) managing languages, XP, streaks, crowns, milestones, SRS reviews, and posts. |
| `src/components/Kamu.tsx` | Animated SVG mascot with 8 moods, golden crown, and lens aperture ring. |
| `src/components/KamuBubble.tsx` | Speech bubble, interactive `KamuGuideBanner`, and Lore modal. |
| `src/components/WordCard.tsx` | Tri-layer translation card (native script + romanization + phonetic) + slow audio + inline Duolingo pronunciation coach. |
| `src/components/PostCard.tsx` | Merit Hub post card with author streak/crown badges, language chips, and `🔥 💡 👑` reactions. |
| `src/components/ShareCard.tsx` | Collectible `1080×1350` PNG card modal and exporter. |
| `src/app/(tabs)/index.tsx` | Immediate Camera screen with Word of the Day Quest, 1–5 language bar, and quick smart presets. |
| `src/app/result.tsx` | Photo analysis screen with Crown banner, Kamu's Photo Critique, dynamic 1–5 `WordCard` list, and reward modal. |
| `src/app/(tabs)/feed.tsx` | Merit Hub screen with Hall of Fame podium, filters, and community posts. |
| `src/app/(tabs)/profile.tsx` | Profile screen with 1/2/3-Week Streak Trophy Case, streak simulator, 1–5 language toggles, Crowns Vault, Badges, and Rank Path. |
| `src/app/(tabs)/library.tsx` | Saved vocabulary search across 5 scripts + romanizations, category filters, and SRS banner. |
| `src/app/review.tsx` | Spaced-repetition flashcard review session. |
| `src/app/settings.tsx` | Identity, 1–5 language selector, offline mode switch, Android TTS voice diagnostics, and Welcome Tour replay. |
| `src/app/welcome.tsx` | 3-step interactive Kamu introduction tour. |

---

## 4. Live Testing & Expo Go Network Configuration

- **Local Wi-Fi IPv4**: `192.168.1.195` (when VPN `ProTUN` `10.2.0.2` is active, bind Metro to the Wi-Fi interface using `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.195`).
- **Active Expo Go URL**: `exp://192.168.1.195:8082`
- **Verification Commands**:
  ```bash
  npx tsc --noEmit
  npx expo lint
  ```
