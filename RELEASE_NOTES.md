# LingoLens v2.0.0 — Release Notes (Google Pixel 9 Pro XL Edition)

## Highlights
- **Immediate Camera Launch**: The app opens directly onto the active Camera screen (`src/app/(tabs)/index.tsx`) and automatically requests camera permissions so users can snap photos right away.
- **5-Language Dynamic Polyglot Engine**: Full support for **Spanish (`es`), English (`en`), Japanese (`ja`), Hindi (`hi`), and Mandarin (`zh`)** with native scripts (`漢字/かな`, `देवनागरी`, `简体中文`), Latin romanization (`Rōmaji`, `ISO Transliteration`, `Hanyu Pinyin`), phonetic guides, and normal/slow (`🐢 0.52x`) TTS playback. Users can dynamically toggle between 1 and 5 simultaneous languages.
- **Duolingo-Style Pronunciation Module**: Interactive voice & syllable test under each translation card (`>= 75%` accuracy threshold, 3-attempt rule, syllable-level feedback, and *"Can't speak now"* skip option). Points (`+15 XP`) are awarded strictly upon passing validation.
- **Photo Crowns & 1/2/3-Week Streak Trophies**:
  - Photographing the **Word of the Day** unlocks a **Daily Photo Crown** (`Bronze` -> `Silver` -> `Gold`).
  - Consecutive daily photo streaks unlock **Week 1 (7d · +100 XP)**, **Week 2 (14d · +250 XP)**, and **Week 3 (21d · +500 XP · Three-Week Dynasty)** trophies.
- **Merit Hub Social Network**: Upgraded community feed (`src/app/(tabs)/feed.tsx`) featuring a live **Merit & Streak Hall of Fame** leaderboard, crown/streak filters, and interactive reactions (`🔥`, `💡`, `👑`).
- **Kamu Mascot Evolution**: Full backstory (`KAMU_LORE`), 8 animated SVG moods including `'excited'` and `'crowned'`, contextual guide banners across screens, and witty object-specific comments (`kamuQuip`) on every photo taken.
- **100% English Codebase & UI**: All source files, UI copy, comments, and documentation are unified in English.
