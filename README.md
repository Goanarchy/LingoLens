# LingoLens v2.0.0 · Google Pixel 9 Pro XL Edition

**Snap any object with your camera and master its name across five world languages simultaneously: Spanish, English, Japanese, Hindi, and Mandarin.**

Built with **Expo SDK 58 + React Native 0.88.1 + TypeScript**, LingoLens v2.0.0 is engineered to run at 100% fluidity inside **Expo Go** on the **Google Pixel 9 Pro XL**—with zero API keys, zero accounts, and full offline resilience.

---

## Key Features (v2.0.0 Upgrade)

### 1. Immediate Camera Launch & Pixel 9 Pro XL Optimization
- **Instant Viewfinder**: Launching LingoLens opens directly onto the live camera viewfinder (`src/app/(tabs)/index.tsx`) and automatically requests camera access so you can snap a photo immediately.
- **50 MP Sensor Downscaler**: High-resolution captures from the Google Pixel 9 Pro XL camera are downscaled on-device to `1024px` (`0.72` JPEG quality) via `expo-image-manipulator` (`src/lib/image.ts`), ensuring fast, crash-free cloud inference and memory safety inside Expo Go.
- **Word of the Day Quest Banner**: Displays today's target object right above the viewfinder, with native audio preview and one-tap quest testing.

### 2. Dynamic 5-Language Engine (1 to 5 Simultaneous Cards)
- **Supported Languages**:
  - 🇪🇸 **Spanish** (`es-ES` · Latin script)
  - 🇬🇧 **English** (`en-US` · Latin script)
  - 🇯🇵 **Japanese** (`ja-JP` · Kanji & Kana + **Hepburn Rōmaji**)
  - 🇮🇳 **Hindi** (`hi-IN` · Devanagari script + **ISO Transliteration**)
  - 🇨🇳 **Mandarin** (`zh-CN` · Simplified Hanzi + **Hanyu Pinyin with tone marks**)
- **Dynamic Filtering**: Toggle between **1 and 5 active languages** directly from the Camera bar, Result screen, Profile, or Settings. Selecting 1 language displays 1 card; selecting 3 displays 3 simultaneously; selecting 5 displays all 5.
- **Tri-Layer Lexicon**: Every card renders the **native script**, **Latin romanization** (for non-Latin scripts), **phonetic pronunciation guide** (`/mahn-SAH-nah/`), example sentence + English meaning, normal TTS playback (`0.85x`), and Duolingo-style slow turtle playback (`🐢 0.52x`).

### 3. Duolingo-Style Pronunciation Module
- **Pedagogical Voice Validation**: Expand the pronunciation coach under any language card (`src/components/WordCard.tsx`, `src/lib/pronunciation-engine.ts`).
- **Strict Scoring & 3-Attempt Rule**: Uses normalized Levenshtein similarity across native script, romanization, and phonetic syllables with a **`>= 75%` passing threshold**.
- **XP Gated by Accuracy**: Pronunciation points (`+15 XP`) and Gold Crown upgrades are awarded **only** when pronunciation passes validation. Includes syllable-by-syllable color feedback and a *"Can't speak now"* skip option.

### 4. Photo Crowns, 1/2/3-Week Streaks & Merit Social Network
- **Daily Photo Crowns**: Photographing an object related to the **Word of the Day** awards a **Bronze Crown** (`+25 XP`), upgrading to **Silver** when saved to the Library and **Gold** when passing the pronunciation check.
- **1-Week, 2-Week & 3-Week Consistency Trophies**:
  - **Week 1 (7 consecutive days)**: `🥉 Bronze Lens Crown` (`+100 XP`)
  - **Week 2 (14 consecutive days)**: `🥈 Silver Prism Trophy` (`+250 XP`)
  - **Week 3 (21 consecutive days)**: `👑 Golden Aperture Crown · Three-Week Dynasty` (`+500 XP`)
- **Merit Hub (`src/app/(tabs)/feed.tsx`)**: Social leaderboard and community feed celebrating photo streaks, Word of the Day crowns, polyglot ranks, and interactive reactions (`🔥`, `💡`, `👑`).

### 5. Kamu — The Prism Chameleon Mascot
- **Origin & Lore (`src/lib/kamu.ts`)**: Hatched inside a vintage telephoto lens in a Kyoto camera shop, Kamu shifts chromatic scales to match the language you are practicing.
- **Enhanced SVG & Moods (`src/components/Kamu.tsx`)**: Features 8 expressive moods (`idle`, `happy`, `excited`, `crowned`, `confused`, `sleepy`, `smug`, `wink`), an optical aperture ring in his eye, and a golden crown on his crest.
- **Photo-Specific Witty Quips**: Every analyzed photo includes a funny, object-specific remark (`result.kamuQuip`) tailored to what you just photographed, plus interactive guide banners (`KamuGuideBanner`) across all tabs.

---

## Project Structure

```text
src/
├── app/
│   ├── _layout.tsx           # Root Stack navigation & dark status bar
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom tabs (Camera, Library, Merit Hub, Profile)
│   │   ├── index.tsx         # Immediate Camera screen + Word of the Day + Language bar
│   │   ├── library.tsx       # Saved vocabulary search across 5 scripts + SRS entrypoint
│   │   ├── feed.tsx          # Merit Hub: Streak Podium + Crown Catches feed
│   │   └── profile.tsx       # 1/2/3-Week Streak Trophies, Crowns Vault, Badges & Ranks
│   ├── result.tsx            # Vision AI result, Kamu photo quip, Crown banner & WordCards
│   ├── review.tsx            # SM-2-lite Spaced Repetition flashcards
│   ├── settings.tsx          # Dynamic languages, Vision AI toggle & TTS voice diagnostics
│   └── welcome.tsx           # Interactive 3-step Kamu tour
├── components/
│   ├── Kamu.tsx              # Animated SVG mascot with 8 moods & golden crown
│   ├── KamuBubble.tsx        # Speech bubble + interactive KamuGuideBanner + Lore modal
│   ├── WordCard.tsx          # 5-language card + slow turtle audio + Duolingo voice coach
│   ├── PostCard.tsx          # Merit Hub post card with streak/crown badges & reactions
│   ├── ShareCard.tsx         # Collectible 1080x1350 PNG card exporter
│   ├── BadgeTile.tsx         # Achievement badge tile
│   ├── XPBar.tsx             # Animated progress bar
│   ├── Screen.tsx            # Edge-to-edge SafeArea wrapper
│   └── ui.tsx                # Design system primitives
├── lib/
│   ├── languages.ts          # 5 mandatory languages (es, en, ja, hi, zh) & script metadata
│   ├── demoCatalog.ts        # 24-object polyglot catalog + daily word matcher + Kamu quips
│   ├── vision.ts             # Keyless Qwen2.5-VL cloud cascade + local catalog fallback
│   ├── pronunciation-engine.ts # Duolingo-style syllable & Levenshtein pronunciation scorer
│   ├── speech-recognition.ts # Hardware ASR wrapper + Expo Go safe fallback
│   ├── gamification.ts       # Ranks, 1/2/3-week streak milestones, and 16 badges
│   ├── kamu.ts               # Kamu lore, screen tips, and object-specific photo quips
│   ├── image.ts              # Pixel 9 Pro XL 50MP downscaler (1024px JPEG)
│   ├── tts.ts                # Native TTS wrapper (normal 0.85x & slow 0.52x speeds)
│   ├── srs.ts                # Spaced repetition scheduler
│   └── types.ts              # Shared TypeScript interfaces
├── data/
│   └── seed.ts               # Merit leaderboard rivals & initial community discoveries
├── store/
│   └── useAppStore.ts        # Persisted Zustand store (lingolens-v2)
└── theme/
    └── index.ts              # Dark-mode palette, spacing, and typography tokens
```

---

## Running on Google Pixel 9 Pro XL with Expo Go

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Metro bundler:
   ```bash
   npx expo start --tunnel
   ```
3. Open **Expo Go** on your **Google Pixel 9 Pro XL** and scan the QR code.
4. Type-check and lint:
   ```bash
   npx tsc --noEmit
   npx expo lint
   ```
