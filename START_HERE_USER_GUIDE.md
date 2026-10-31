# LingoLens v2.0.0 — Quick Start & Testing Guide (Google Pixel 9 Pro XL)

**Version 2.0.0** · [github.com/Goanarchy/LingoLens](https://github.com/Goanarchy/LingoLens)

Open the app and your camera activates immediately: snap any object (or today's **Word of the Day**) to discover its name across **1 to 5 simultaneous languages** (**Spanish, English, Japanese, Hindi, and Mandarin**) with native script, romanization (*Rōmaji, Transliteration, Pinyin*), phonetic pronunciation, normal & slow (`🐢`) audio, and a **Duolingo-style pronunciation test**.

---

## 1. Requirements

| Item | Detail |
|---|---|
| Target Device | **Google Pixel 9 Pro XL** (or any Android 10+ / iOS 15+ phone) |
| Runtime | **Expo Go** (SDK 58) from Google Play Store / App Store |
| Computer | Node.js 20+ and npm |
| Network | Phone and computer on the **same Wi-Fi network** |
| Cost | **$0** — 100% free, keyless Vision AI, no accounts or subscriptions |

---

## 2. Install & Run on Google Pixel 9 Pro XL

```bash
# 1. Enter the project folder
cd lingolens

# 2. Install dependencies (first time only)
npm install

# 3. Start the Metro dev server on your local Wi-Fi
npx expo start --lan
```

> **VPN Tip (Windows)**: If you have a VPN active (such as ProtonVPN `ProTUN`), set `REACT_NATIVE_PACKAGER_HOSTNAME=<your-Wi-Fi-IPv4>` (for example `192.168.1.195`) before running `npx expo start --lan` so your Pixel 9 Pro XL connects directly over Wi-Fi.

---

## 3. Complete Feature Walkthrough (v2.0.0)

1. **Immediate Camera Launch (`Camera` tab)**:
   - The app opens directly onto the live camera viewfinder and requests camera permission automatically.
   - Check the **Word of the Day Quest** banner at the top (`👑 +25 XP`): tap it to hear today's target word or tap **Try Quest** to test it immediately.
2. **Dynamic 1-to-5 Language Bar**:
   - Tap the flag pills (`🇪🇸 Spanish`, `🇺🇸 English`, `🇯🇵 Japanese`, `🇮🇳 Hindi`, `🇨🇳 Mandarin`) on the Camera screen, Result screen, Profile, or Settings.
   - Selecting **1 language** shows **1 card**; selecting **3** shows **3 simultaneously**; selecting **5** shows all **5**.
3. **Result Screen & Kamu's Photo Critique**:
   - After capturing a photo, **Kamu** (the one-eyed prism chameleon) delivers a funny, object-specific critique (`"Kamu's Photo Critique"`).
   - If your photo matches the **Word of the Day**, you unlock today's **Daily Photo Crown (Bronze)** and `+25 Bonus XP`.
4. **Native Script, Romanization, Phonetics & Slow Audio**:
   - Each card displays the word in its **native script** (`りんご`, `सेब`, `苹果`), **Latin romanization** (`Rōmaji`, `Transliteration`, `Pinyin`), and **phonetic guide** (`/reen-GOH/`).
   - Tap **🔊** for normal speed (`0.85x`) or **🐢** for slow articulation (`0.52x`).
5. **Duolingo-Style Pronunciation Module**:
   - Tap **Practice Pronunciation · +15 XP** beneath any card.
   - Hold the microphone button while speaking the word clearly, then verify the syllable pattern.
   - Requires **`>= 75%` accuracy** within **3 attempts** to earn `+15 XP` and upgrade today's Crown to **Gold**. Includes a *"Can't speak now"* skip option.
6. **1-Week, 2-Week & 3-Week Photo Streak Trophies (`Profile` tab)**:
   - View your progress toward **Week 1 (7 days · +100 XP · Bronze Lens Crown)**, **Week 2 (14 days · +250 XP · Silver Prism Trophy)**, and **Week 3 (21 days · +500 XP · Golden Aperture Crown)**.
   - Use the **Test Streak Rewards (`🔥 1W`, `🔥 2W`, `🔥 3W`)** buttons in Profile to test and verify all three milestone unlocks immediately.
7. **Merit Hub Social Network (`Merit Hub` tab)**:
   - Compete on the **Merit & Streak Hall of Fame** podium ranked by consecutive photo streaks, crowns, and XP.
   - Filter posts by `All Discoveries`, `👑 Crown Catches`, or `🔥 7d+ Streaks`, and react with `🔥`, `💡`, and `👑`.
8. **Library & Spaced Repetition (`Library` tab)**:
   - Search saved words across all 5 scripts and romanizations, export `1080×1350` collectible PNG cards, and practice flashcards with SM-2-lite spaced repetition (`/review`).

---

## 4. License

MIT © 2026 Victor Montoya Rojas. See [`LICENSE`](./LICENSE).
