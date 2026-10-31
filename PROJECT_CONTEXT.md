# LingoLens — Comprehensive Project Context & Evolution History (`PROJECT_CONTEXT.md`)

> **Purpose of this document**: This file serves as the authoritative, end-to-end context, architectural specification, and historical log of **LingoLens** ("Lingo Leans") from its initial inception (`v1.0.0`) through its multi-agent scaling upgrade (`v2.0.0`). Future AI models, autonomous agent teams, and developers should read this file first before planning or implementing any new features.

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

## 2. Chronological Evolution of the App (Inception to v2.0.0)

### Phase 0 — Initial Conception (`v1.0.0`)
1. **Original Goal**: Build a mobile app where taking a photo of an everyday object translates it into five languages with native audio playback, spaced repetition flashcards, a local library, and a basic community feed—without requiring paid API keys, user accounts, or backend servers.
2. **Initial Tech Stack**:
   - Expo Router (`src/app/`) with bottom tabs (`index`, `library`, `feed`, `profile`) and modal/stack screens (`welcome`, `result`, `review`, `settings`).
   - Keyless vision inference using open vision-language models (`Qwen2.5-VL`) hosted on OVHcloud AI Endpoints with an offline fallback catalog.
   - Local state persistence via `zustand` + `@react-native-async-storage/async-storage`.
   - Mascot introduction: **Kamu**, a one-eyed chameleon SVG character.
   - Collectible image card export (`1080×1350` PNG) via `react-native-view-shot` + `expo-sharing`.

### Phase 1 — Multi-Agent Scaling & Pixel 9 Pro XL Upgrade (`v2.0.0`)
The user requested a comprehensive 5-Agent architectural and product upgrade with the following exact requirements:

1. **Agent 1 — Research, Architecture & Vision AI Audit**:
   - Inspect and preserve the repository's folder structure (`src/app`, `src/components`, `src/lib`, `src/store`, `src/data`, `src/theme`).
   - Optimize image capture and memory usage for the **Google Pixel 9 Pro XL** 50 MP camera sensor running inside **Expo Go**.
   - Connect real-time image analysis with the **"Word of the Day"** quest and object detection.

2. **Agent 2 — Core UX, Immediate Camera, Dynamic 5-Language Engine & Duolingo Pronunciation**:
   - **Immediate Camera Launch**: Opening the app must activate the camera screen immediately (`src/app/(tabs)/index.tsx`), ready to capture a photo without blocking onboarding screens.
   - **Dynamic Multilingual Support (5 Mandatory Languages)**:
     - Supported languages: **Spanish (`es`), English (`en`), Japanese (`ja`), Hindi (`hi`), and Mandarin (`zh`)**.
     - Dynamic simultaneous display: If the user selects 1 language, display 1 card; if 3, display 3 simultaneously; if 5, display all 5.
     - Each language card must display:
       1. **Translated word in native script** (`manzana`, `apple`, `りんご`, `सेब`, `苹果`).
       2. **Latin romanization** (*Hepburn Rōmaji*, *ISO Transliteration*, *Hanyu Pinyin with tone marks*).
       3. **Phonetic pronunciation guide** (`/mahn-SAH-nah/`, `/reen-GOH/`, `/píng-guǒ/`) + normal (`0.85x`) and slow turtle (`🐢 0.52x`) TTS audio.
   - **Duolingo-Style Pronunciation Module**:
     - Interactive voice & syllable test directly beneath each translation card.
     - Points (`+15 XP`) are awarded **strictly when pronunciation is validated as passing** (`>= 75%` similarity threshold, 3-attempt limit, syllable-by-syllable visual feedback, and *"Can't speak now"* skip option).

3. **Agent 3 — Rewards System, Photo Streaks (1, 2 & 3 Weeks) & Merit Social Network**:
   - **Word of the Day Crowns**: Photographing an object related to the "Word of the Day" awards bonus XP (`+25 XP`) and unlocks a **Daily Photo Crown** (`Bronze` on photo match → `Silver` on saving to Library → `Gold` on passing the pronunciation test).
   - **Consistency Milestones (1, 2 & 3 Consecutive Weeks)**:
     - **Week 1 (7 days)**: `🥉 Bronze Lens Crown` · Title: *Shutter Sprinter* · **`+100 XP`**.
     - **Week 2 (14 days)**: `🥈 Silver Prism Trophy` · Title: *Fortnight Focus Master* · **`+250 XP`**.
     - **Week 3 (21 days)**: `👑 Golden Aperture Crown` · Title: *Three-Week Dynasty* · **`+500 XP`**.
   - **Merit Social Network (`Merit Hub`)**:
     - Community section (`src/app/(tabs)/feed.tsx`) featuring a **Merit & Streak Hall of Fame** leaderboard ranking users by consecutive photo streaks, crowns, and XP, plus filters (`All Discoveries`, `👑 Crown Catches`, `🔥 7d+ Streaks`) and merit reactions (`🔥`, `💡`, `👑`).

4. **Agent 4 — Identity, Mascot Evolution (`Kamu`) & Contextual Personality**:
   - **Solid Backstory (`KAMU_LORE`)**: Kamu is a *One-Eyed Prism Chameleon* hatched inside a telephoto camera lens in a Kyoto optical workshop (`Periscope Lens Chamber #09`), whose scales shift color to match each language.
   - **Enhanced SVG & Fluid Animations (`src/components/Kamu.tsx`)**: 8 animated moods (`idle`, `happy`, `excited`, `crowned`, `confused`, `sleepy`, `smug`, `wink`), optical aperture ring inside his lens-eye, and a royal golden crown SVG on his crest.
   - **Contextual Interactive Guide (`KamuGuideBanner`)**: Appears across Camera, Library, Merit Hub, and Profile screens with tap-to-cycle tips and an interactive Lore modal.
   - **Photo-Specific Witty Quips (`kamuQuip`)**: Kamu always comments something funny, witty, and specific about the exact object the user just photographed (`src/lib/kamu.ts`, `src/lib/demoCatalog.ts`, `src/app/result.tsx`).

5. **Agent 5 — QA, Hardware Optimization & GitHub Deployment**:
   - Zero TypeScript errors (`npx tsc --noEmit`) and zero ESLint errors (`npx expo lint`).
   - Safe execution inside **Expo Go** on Android (`Constants.executionEnvironment === 'storeClient'` guard prevents native module warnings for optional dev-build packages).
   - All changes committed and pushed in English to `origin/main`.

---

## 3. Complete Architecture & File Map

```text
lingolens/
├── app.json                          # Expo SDK 58 config (v2.0.0, dark UI, English permissions)
├── package.json                      # Dependencies & scripts (Expo 58, RN 0.88.1, Zustand 5)
├── tsconfig.json                     # Strict TypeScript config with @/* path alias
├── README.md                         # Developer quickstart & feature overview
├── RELEASE_NOTES.md                  # v2.0.0 release summary
├── PROJECT_CONTEXT.md                # This comprehensive context document for future models
└── src/
    ├── app/                          # Expo Router screens
    │   ├── _layout.tsx               # Root Stack navigator + SafeAreaProvider + dark StatusBar
    │   ├── (tabs)/
    │   │   ├── _layout.tsx           # Bottom TabBar (Camera, Library, Merit Hub, Profile)
    │   │   ├── index.tsx             # Immediate Camera viewfinder, Word of the Day Quest,
    │   │   │                         # live 1–5 language toggle bar & instant smart presets
    │   │   ├── library.tsx           # Saved vocabulary search across 5 scripts + SRS banner
    │   │   ├── feed.tsx              # Merit Hub: Hall of Fame Podium + Crown/Streak filters
    │   │   └── profile.tsx           # 1/2/3-Week Streak Trophies, Crowns Vault, 1–5 Lang
    │   │                             # selector, 16 Badges & Polyglot Rank Path
    │   ├── result.tsx                # Vision AI analysis, Kamu photo critique, Crown banner,
    │   │                             # dynamic 1–5 WordCards & reward summary modal
    │   ├── review.tsx                # SM-2-lite Spaced Repetition flashcard session
    │   ├── settings.tsx              # Display name, 1–5 language selector, offline switch,
    │   │                             # Android TTS voice diagnostics & progress reset
    │   └── welcome.tsx               # Optional 3-step interactive Kamu tour
    ├── components/
    │   ├── Kamu.tsx                  # Animated SVG mascot (8 moods, lens aperture, crown)
    │   ├── KamuBubble.tsx            # Speech bubble + KamuGuideBanner + Lore modal
    │   ├── WordCard.tsx              # 5-script card + slow turtle TTS + Duolingo voice coach
    │   ├── PostCard.tsx              # Merit Hub post card with streak/crown pills & reactions
    │   ├── ShareCard.tsx             # 1080x1350 PNG collectible card generator
    │   ├── BadgeTile.tsx             # Tier-colored achievement badge tile
    │   ├── XPBar.tsx                 # Animated progress bar
    │   ├── Screen.tsx                # Edge-to-edge SafeAreaView + gradient background
    │   └── ui.tsx                    # Shared UI primitives (Card, PrimaryButton, Chip, etc.)
    ├── lib/
    │   ├── languages.ts              # 5 mandatory languages (es, en, ja, hi, zh) & script meta
    │   ├── types.ts                  # Core TypeScript types (Translation, ScanResult, Post, etc.)
    │   ├── demoCatalog.ts            # 24-item offline polyglot catalog + daily match + quips
    │   ├── vision.ts                 # Hybrid Qwen2.5-VL cloud vision + local catalog fallback
    │   ├── pronunciation-engine.ts   # Duolingo-style 3-attempt syllable & Levenshtein scorer
    │   ├── speech-recognition.ts     # Hardware/Web ASR + Expo Go safe acoustic fallback
    │   ├── gamification.ts           # 7 Ranks, 3 Weekly Streak Milestones, 16 Badges
    │   ├── kamu.ts                   # Kamu lore, chromatic map, screen tips & photo quips
    │   ├── image.ts                  # Pixel 9 Pro XL 50MP -> 1024px JPEG downscaler
    │   ├── tts.ts                    # Native Speech wrapper (normal 0.85x & slow 0.52x)
    │   └── srs.ts                    # Spaced repetition interval & ease scheduler
    ├── data/
    │   └── seed.ts                   # MERIT_RIVALS leaderboard peers & initial community posts
    ├── store/
    │   └── useAppStore.ts            # Zustand persisted store ('lingolens-v2' in AsyncStorage)
    └── theme/
        └── index.ts                  # Colors, gradients, spacing, and border radii
```

---

## 4. State Management Contract (`useAppStore.ts`)

- **Storage Key**: `lingolens-v2` (persisted via `AsyncStorage`).
- **Key State Slices**:
  - `learningLangs: LangCode[]` — Array of 1 to 5 active languages (`['es', 'en', 'ja', 'hi', 'zh']` by default). Guaranteed non-empty via `sanitizeLangs()`.
  - `scoreboard: Record<LangCode, number>` — Per-language XP earned from passing pronunciation checks.
  - `xp: number` — Global experience points driving the 7 Polyglot Ranks (`Curious` → `Legend`).
  - `stats: Stats` — Tracks `photoStreak`, `bestPhotoStreak`, `lastPhotoDay`, `photosTaken`, `streak`, `pronunciationPasses`, `pronunciationAttempts`, `audioPlays`, `postsCreated`, and `likesGiven`.
  - `crowns: CrownRecord[]` — History of Daily Photo Crowns (`day`, `tier: 'bronze' | 'silver' | 'gold'`, `object`, `dailyWord`).
  - `unlockedMilestones: Record<string, string>` — Tracks unlocked 1-week (`streak_week_1`), 2-week (`streak_week_2`), and 3-week (`streak_week_3`) photo streak trophies.
  - `pronunciationPassedKeys: Record<string, boolean>` — Keys of the form `"${object}:${langCode}"` that have passed the `>= 75%` pronunciation check.
- **Key Actions**:
  - `toggleLearningLang(code)` / `setLearningLangs(codes)` — Dynamically updates the 1–5 active languages.
  - `recordPhotoCapture(result)` — Increments `photoStreak`, awards `+10 XP` base photo XP, awards `+25 XP` + `Bronze` Crown if `result.dailyMatch.matched` is true, and unlocks 1/2/3-week trophies (`+100 / +250 / +500 XP`).
  - `registerWord(result)` — Saves word to `learned`, schedules initial SRS review, and upgrades today's Crown from `Bronze` to `Silver`.
  - `recordPronunciationAttempt(object, lang, passed, points, isDailyMatch)` — Awards `+15 XP` (first pass) or `+3 XP` (practice) **only when `passed === true`**, updates `scoreboard[lang]`, and upgrades today's Crown to `Gold`.
  - `simulateStreakMilestone(7 | 14 | 21)` — Instant QA helper on the Profile screen to test and demonstrate the 1-week, 2-week, and 3-week streak trophies.

---

## 5. Guidelines for Future AI Models & Updates

1. **Preserve Expo Go Compatibility**: Before importing any native module not bundled in standard Expo Go, guard it with `Constants.executionEnvironment !== 'storeClient'` (as done in `src/lib/speech-recognition.ts`) and provide a smooth JS/UI fallback.
2. **Keep All 5 Languages First-Class**: Any new vocabulary, AI prompt, or UI component must support `es`, `en`, `ja`, `hi`, and `zh` with `word` (native script), `romanization`, and `phonetic` fields.
3. **Maintain 100% English in Repo**: Never introduce non-English identifiers, comments, or UI strings into source files.
4. **Always Verify Before Committing**:
   ```bash
   npx tsc --noEmit
   npx expo lint
   ```

