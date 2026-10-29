# LingoLens

**One photo, five languages.** Point the camera at any object: LingoLens identifies it and shows its name in Spanish, English, French, German and Italian, with written pronunciation and audio. Save it, review it with spaced repetition, share a card and learn with Kamu, the mascot.

Mobile app built with **Expo SDK 58 + React Native 0.88 + TypeScript**.

**100% free — no accounts, no logins, no API keys.**

**Version:** 1.1.0 · **Repository:** [github.com/Goanarchy/LingoLens](https://github.com/Goanarchy/LingoLens) · **Changelog:** [RELEASE_NOTES.md](./RELEASE_NOTES.md)

---

## What already works

- 🎬 **First-run intro**: three short steps that explain the flow and preview the mascot before the camera permission is requested.
- 🦎 **Kamu, the original mascot**: a one-eyed chameleon drawn in SVG, with five moods, language-based colors and reduced-motion support. It appears while the photo is analyzed with a *“What the heck is this?”* face, pointing at the object.
- 📷 **Live camera** (expo-camera) with **gallery** as a fallback.
- 🧠 **Free, keyless vision AI**: open models from OVHcloud AI Endpoints (Qwen2.5-VL 72B and fallbacks), with automatic model rotation.
- 🛟 **Never blocked**: if the free AI fails or is rate-limited, the app falls back to a local catalog of 18 objects and tells you clearly.
- 🗣️ **Real audio** in all 5 languages using the device voice (expo-speech), at no cost.
- 🔤 **Written pronunciation** under every word (e.g. `/man-SAH-nah/`) plus article and example sentence.
- 📚 **Library** with search across the five languages, category filters, favorites and per-word audio.
- 🧠 **Spaced-repetition review**: up to 10 flashcards per session, three grades (Again / Good / Easy) and an SM-2-lite scheduler.
- 🖼️ **Shareable word card**: a branded PNG generated on the device and sent to the system share sheet.
- ☀️ **Word of the day** with one-tap audio and haptics.
- ⭐ **XP, 7 global ranks** (Curious → Legend) and an **independent rank per language** (Beginner → Master).
- 🏅 **12 badges** that unlock based on your real progress.
- 🔥 **Daily streak** and statistics (words, languages, audios, streak).
- 🌍 **Social feed** with posts, likes and your own discoveries.
- 💾 **Local persistence** (AsyncStorage): your progress survives app restarts.
- 📱 **Optimized for large photos**: downscales to 1024 px before upload (key on the Pixel 9 Pro XL, which shoots 50 MP photos).
- ♿ **Accessibility**: screen-reader labels, system font scaling and reduced-motion support.

---

## Try it on your Google Pixel 9 Pro XL

### 1. Requirements

On the PC:

- **Node 18 or newer** (tested with Node 24).
- Phone and PC on the **same Wi-Fi network**.

On the phone:

- Install **Expo Go** from Google Play:
  `https://play.google.com/store/apps/details?id=host.exp.exponent`

### 2. Start the project

```powershell
npm install
npm start
```

A **QR code** appears in the terminal.

### 3. Connect

1. Open **Expo Go** on the Pixel.
2. Tap **"Scan QR code"** (or the scan icon).
3. Point it at the QR code in the terminal.
4. Wait for the first compile (30–90 s).

> If the QR code does not appear, or the terminal is in compact mode, press `s` in the Expo terminal.

### 4. First run

1. Complete the **3-step intro** (or tap **Skip**). The camera permission is only requested when you take a photo.
2. Point at an object with good light and press the white shutter button.
3. Kamu appears while the photo is analyzed, then the app shows the 5 cards.
4. Tap the **speaker** on any language to hear the pronunciation.
5. Press **Save word** to earn XP, then **Share card** to export a PNG or **Share to feed**.
6. Open **Library** to search, filter and favorite your words, and **Review** to practice with spaced repetition.

### 5. Audio in the 5 languages (important on Android)

Audio uses the **Google Text-to-Speech** engine. Most Pixel phones ship Spanish and English voices, but French, German and Italian may be missing:

1. Open **Settings** in LingoLens → **Device voices**.
2. Tap **Test** on each language. If nothing plays, press **Open system voice settings**.
3. On Android: **System → Languages → Text-to-speech output → Google engine → Install voice data**.
4. Download **French, German and Italian**.
5. Return to the app and test again (no restart needed).

### 6. If the QR code does not connect

| Symptom | Fix |
|---|---|
| Expo Go says "Could not connect" | Same Wi-Fi, no VPN, no guest network. |
| The PC has a firewall | Allow Node.js on the Windows private network. |
| Wi-Fi with client isolation | Use `npx expo start --tunnel` (slower, but works on any network). |
| The terminal shows a different port | Use the updated QR code; do not type the URL by hand. |
| "Project is incompatible with this version of Expo Go" | Update Expo Go from the Play Store. |

### 7. If something fails inside the app

| Problem | Cause and fix |
|---|---|
| "We could not identify the photo" | No internet or the AI is saturated. Tap **Use demo** or enable **Offline mode** in Settings. |
| The AI takes 10–30 s | Normal: the free tier allows 2 requests/minute per IP. If saturated, it rotates models or falls back to the local catalog. |
| No audio | The language voice pack is missing (step 5) or media volume is low. |
| The camera is black | Close other apps using the camera; check the permission in Android Settings → Apps → Expo Go → Permissions. |
| The app crashes when taking a photo | Photos are downscaled before upload to avoid this. If it still happens, pick the photo from the **gallery**. |
| The feed does not update across phones | It is local by design: no server, no accounts. |

> **Android 15/16 (Pixel 9 Pro XL):** the app uses Expo Go and standard APIs, so no special storage permissions are required. The photo picker uses the system picker, which needs no extra permission.

---

## How the free AI works (no key)

```
Photo → downscale to 1024 px JPEG → OVHcloud AI Endpoints (anonymous, no key)
      → Qwen2.5-VL 72B → if error/429/timeout → Qwen3.8-27B → Qwen3.5-9B → Qwen3.6-27B
      → if all fail → local catalog of 18 objects (announced demo mode)
```

- **Provider:** `https://oai.endpoints.kepler.ai.cloud.ovh.net/v1` (OVHcloud AI Endpoints).
- **Anonymous tier:** no signup, no key, **2 requests/minute per IP and model**.
- **Vision models** used in a cascade, with a total budget of ~55 s.
- **Privacy:** the photo is sent to the provider only for identification; there is no backend of our own and nothing is stored on our servers. If you do not want to send photos, enable **Offline mode**.
- **No cost:** no card, no subscription, no embedded keys.

> ⚠️ This is a free, best-effort service: it may change, throttle or go down without notice. That is why the local fallback exists and the app always responds.

---

## Project structure

```
src/
  app/                      # Routes (Expo Router)
    _layout.tsx             # Root stack + SafeArea
    welcome.tsx             # 3-step first-run intro with Kamu
    (tabs)/
      _layout.tsx           # Tabs: Scan / Library / Community / Profile
      index.tsx             # Camera, gallery, daily word and photo compression
      library.tsx           # Search, filters, favorites and share cards
      feed.tsx              # Local social feed
      profile.tsx           # Rank, stats, languages, badges
    result.tsx              # Identification + 5 cards + Kamu + share card
    review.tsx              # Spaced-repetition flashcards
    settings.tsx            # Name, free AI, voice diagnostics, reset
  components/               # Reusable UI (Screen, WordCard, Kamu, ShareCard…)
  data/seed.ts              # Sample posts
  lib/
    vision.ts               # Keyless free AI + cascade + demo fallback
    image.ts                # Downscale/compress before upload
    demoCatalog.ts          # 18 objects with translations and phonetics
    languages.ts            # The 5 languages and their TTS voices
    gamification.ts         # Ranks, per-language ranks, badges, XP
    kamu.ts                 # Mascot colors and lines
    srs.ts                  # SM-2-lite spaced-repetition scheduler
    tts.ts                  # System voices + diagnostics
    types.ts
  store/useAppStore.ts      # Global state (zustand + persist)
  theme.ts                  # Colors, radii, spacing
```

### How progress is calculated

- Saving a new word: **+12 XP + 2 XP per language** (22 XP with 5 languages).
- Reviewing a card: **+1 XP** (Again), **+4 XP** (Good) or **+6 XP** (Easy).
- First post: **+15 XP**; subsequent posts: **+6 XP**.
- Streak: increases when you save or review a word on consecutive days.
- Badges: evaluated after every action (words, languages, audios, posts, streak, XP).

| Rank | XP |
|---|---|
| 🌱 Curious | 0 |
| 🧭 Explorer | 120 |
| ✈️ Traveler | 350 |
| 📚 Linguist | 700 |
| 🌍 Polyglot | 1200 |
| 🏛️ Ambassador | 2000 |
| 👑 Legend | 3200 |

Per-language ranks: 🐣 Beginner (0) · 💬 Chatterbox (5) · 🗣️ Conversationalist (15) · 🌊 Fluent (30) · 🎓 Master (60).

---

## Useful commands

```bash
npm start                              # dev server + QR code
npx expo start --tunnel                # if Wi-Fi blocks the connection
npm run web                            # web build (camera needs localhost/HTTPS)
npx tsc --noEmit                       # typecheck
npx expo-doctor                        # project diagnostics
npx expo export --platform android     # validate the bundle
```

---

## Current limitations

- The feed and profiles are **local**: no accounts and no shared server.
- The free AI service allows 2 requests/minute per IP and may be saturated.
- TTS depends on the voices installed on the phone.
- Review scheduling is stored locally; it does not sync between devices.
- The icon is still the Expo placeholder.

**Turning it into a real product:** Supabase backend (auth + posts + storage), a proxy for the AI with rate limiting, feed moderation, server-side XP validation and `eas build`/`eas submit`. No Android Studio or Xcode required.

---

Built with Expo SDK 58. All code lives in `src/`; the project has no generated native folders.
