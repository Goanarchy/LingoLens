# LingoLens — Roadmap, Evolution History & Backlog

**LingoLens — Snap photos, earn crowns, and master five languages (`ES · EN · JA · HI · ZH`)**

Current release: **v2.0.0 · "Google Pixel 9 Pro XL & Multi-Agent Polyglot Edition"** (shipped).
Market context and competitor analysis: [`MARKET_RESEARCH.md`](./MARKET_RESEARCH.md).
Full technical context for AI models: [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md).

---

## 1. Release History (From Inception to v2.0.0)

### v1.0.0 — "Initial Camera-to-5-Languages Prototype" (Shipped)
- Keyless vision identification (`Qwen2.5-VL` on OVHcloud AI Endpoints) with local offline catalog fallback.
- 50 MP image downscaling to `1024px` JPEG (`src/lib/image.ts`) to prevent memory crashes on high-resolution sensors.
- Basic 5-language cards, native TTS playback, XP ranks, and local persistence (`zustand` + `AsyncStorage`).

### v1.1.0 — "Learning Loop" (Shipped)
| # | Feature | Implementation |
|---|---|---|
| W1 | **Interactive Welcome Tour** | 3-step intro route (`/welcome`) with Kamu mascot |
| W2 | **Original SVG Mascot (`Kamu`)** | Code-drawn chameleon (`react-native-svg`) with zero binary bloat |
| W3 | **Searchable Vocabulary Library** | `/library` tab with search, category chips, and favorites |
| W4 | **Spaced-Repetition Flashcards** | SM-2-lite scheduler in `src/lib/srs.ts` + `/review` screen |
| W5 | **Shareable Collectible Card** | `1080×1350` PNG card export (`react-native-view-shot` + `expo-sharing`) |
| W6 | **Daily Word + Haptics** | Deterministic daily word selection + `expo-haptics` tactile feedback |

### v2.0.0 — "Pixel 9 Pro XL, 5-Script Engine, Duolingo Voice Coach & Merit Hub" (Shipped)
| Agent Phase | Shipped Deliverable | Key Files |
|---|---|---|
| **Agent 1: Architecture & Vision Audit** | Optimized 50 MP sensor pipeline for **Google Pixel 9 Pro XL** in **Expo Go**; hybrid vision AI now evaluates **Word of the Day** matches (`dailyMatch`) and generates object-specific mascot commentary (`kamuQuip`). | `src/lib/image.ts`, `src/lib/vision.ts`, `src/lib/demoCatalog.ts` |
| **Agent 2: Immediate Camera, 5-Script Engine & Duolingo Pronunciation** | App launches **immediately onto the active Camera screen** (`src/app/(tabs)/index.tsx`). Dynamic **1-to-5 simultaneous language engine** for **Spanish (`es`), English (`en`), Japanese (`ja`), Hindi (`hi`), and Mandarin (`zh`)** showing native script, romanization (*Rōmaji, Transliteration, Pinyin*), phonetic guide, normal/slow (`🐢 0.52x`) TTS, and a **Duolingo-style pronunciation test** (`>= 75%` pass threshold, 3-attempt rule, syllable feedback, XP awarded strictly on pass). | `src/app/(tabs)/index.tsx`, `src/app/result.tsx`, `src/lib/languages.ts`, `src/lib/pronunciation-engine.ts`, `src/lib/speech-recognition.ts`, `src/components/WordCard.tsx` |
| **Agent 3: Crowns, 1/2/3-Week Streaks & Merit Social Network** | **Daily Photo Crowns** (`Bronze` → `Silver` → `Gold`) for catching the Word of the Day; unlockable consistency trophies for **1 Week (7d · +100 XP)**, **2 Weeks (14d · +250 XP)**, and **3 Weeks (21d · +500 XP · Three-Week Dynasty)**; **Merit Hub** social leaderboard & feed with reactions (`🔥`, `💡`, `👑`). | `src/lib/gamification.ts`, `src/store/useAppStore.ts`, `src/app/(tabs)/feed.tsx`, `src/app/(tabs)/profile.tsx`, `src/components/PostCard.tsx` |
| **Agent 4: Mascot Evolution (`Kamu`)** | Full origin story (`KAMU_LORE`), 8 animated SVG moods (including `'excited'` and `'crowned'`), optical lens-eye aperture ring, royal golden crown SVG, contextual `KamuGuideBanner` across tabs, and funny **photo-specific comments (`kamuQuip`)** on every capture. | `src/lib/kamu.ts`, `src/components/Kamu.tsx`, `src/components/KamuBubble.tsx` |
| **Agent 5: QA, Expo Go Safety & GitHub Sync** | 100% English codebase & docs, `Constants.executionEnvironment === 'storeClient'` guard for Expo Go, `0` TypeScript errors, `0` ESLint warnings, synced to `origin/main`. | `app.json`, `AGENTS.md`, `PROJECT_CONTEXT.md`, `README.md`, `RELEASE_NOTES.md` |

---

## 2. Future Backlog (v2.1.0+ Candidates)

- **Opt-in Local Daily Quest Reminder**: Local scheduled notification (`expo-notifications`) reminding the user of today's Word of the Day to protect their 1/2/3-week photo streak.
- **JSON Progress Backup & Restore**: Export/import full `lingolens-v2` state (`learned`, `crowns`, `unlockedMilestones`, `reviews`) via `expo-file-system` + `expo-sharing`.
- **Cloud Merit Sync (Optional)**: Optional anonymous cloud sync (e.g., Supabase free tier) for global Merit Hub leaderboards while keeping offline-first local storage as default.
- **Standalone Dev Build / APK via EAS**: Optional native build (`eas build`) enabling continuous hardware speech streaming alongside the Expo Go guided verifier.
