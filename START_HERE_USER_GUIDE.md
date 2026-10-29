# LingoLens — Quick Start Guide

**Version 1.1.0** · [github.com/Goanarchy/LingoLens](https://github.com/Goanarchy/LingoLens)

Point the camera at an object: LingoLens identifies it and shows its name in Spanish, English, French, German and Italian, with written pronunciation and audio. Save it to your library, review it with spaced repetition and share a card.

---

## 1. Requirements

| Item | Detail |
|---|---|
| Phone | Android 8+ or iOS 15+ (tested on Google Pixel 9 Pro XL) |
| Test app | **Expo Go** (SDK 58) from the Play Store / App Store |
| Computer | Node.js 20+ and npm |
| Network | Phone and computer on the **same Wi-Fi network** |
| Cost | **$0** — no accounts, no API keys, no purchases |

---

## 2. Install and run (5 minutes)

```bash
# 1. Enter the project folder
cd lingolens

# 2. Install dependencies (first time only)
npm install

# 3. Start the dev server
npm start
```

When the QR code appears in the terminal:

1. Open **Expo Go** on your phone.
2. Scan the QR code (Android: "Scan QR code" button; iOS: the system camera).
3. Complete the 3-step intro. The camera permission is requested only when you take the first photo.

> If the QR code does not connect, make sure the phone and PC are on the same Wi-Fi and that the firewall allows Node.js. On Windows you can also run `npm start -- --tunnel`.

---

## 3. How to use it

1. **Intro** → three short steps (or **Skip**) explain the app before any permission.
2. **Scan** → tap the camera button, frame an object and capture. Kamu appears while it is analyzed.
3. **Result** → the app shows the object, its emoji, category and the 5 languages.
4. **Listen** → tap the audio icon on any language to hear the pronunciation.
5. **Save** → save the word to your library and earn XP.
6. **Share card** → export a branded PNG, or publish the discovery in the local feed.
7. **Library** → search across the five languages, filter by category, star favorites and hear each word.
8. **Review** → practice up to 10 flashcards with Again / Good / Easy grading.
9. **Profile** → check XP, global rank, per-language ranks, streak and badges.
10. **Settings** → offline mode, AI status and voice diagnostics.

### If voices are missing

Settings → **Device voices** → tap **Open system voice settings** and install the French, German and Italian packs.

---

## 4. How the free AI works

- Uses **OVHcloud AI Endpoints** on its anonymous tier: no signup and no key required.
- Automatic model cascade: `Qwen2.5-VL-72B-Instruct` → `Qwen3.8-27B` → `Qwen3.5-9B` → `Qwen3.6-27B`.
- Anonymous tier limit: ~2 requests per minute per IP.
- If the AI fails or is saturated, the app uses a **local catalog of 18 objects** so the flow never breaks, shows a notice and offers **Retry with AI**.
- In **Settings → Offline mode** you can force the local catalog.

---

## 5. Common issues

| Symptom | Fix |
|---|---|
| Expo Go does not open the project | Same Wi-Fi, or `npm start -- --tunnel` |
| The camera stays black | Close Expo Go and reopen it; check the camera permission |
| "AI busy" or network error | The free tier is saturated: wait ~1 minute and use **Retry with AI** |
| No audio | Install the voice pack for that language (Settings → Device voices) |
| The app restarts while scanning | Update to 1.0.0: photos are downscaled to 1024 px before upload |

---

## 6. Project structure

```
lingolens/
├── src/
│   ├── app/            # Expo Router routes (welcome, tabs, result, review, settings)
│   ├── components/     # Reusable UI, Kamu mascot and share card
│   ├── lib/            # Free AI, local catalog, gamification, SRS, image
│   ├── store/          # Global state with zustand + AsyncStorage
│   └── theme.ts        # Colors and base styles
├── assets/images/      # Icons and splash
├── app.json            # Expo configuration
├── RELEASE_NOTES.md    # Version history
└── NEXT_VERSION_ROADMAP.md
```

---

## 7. License

MIT © 2026 Victor Montoya Rojas. See [LICENSE](./LICENSE).
