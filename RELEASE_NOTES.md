# Release Notes & Version History

**LingoLens — One photo, five languages**
*GitHub Repository: [github.com/Goanarchy/LingoLens](https://github.com/Goanarchy/LingoLens)*

---

## Version 1.1.0 (Learning Loop)

* **Official Release Date:** October 28, 2026
* **Status:** Available & Active
* **Test channel:** Expo Go (SDK 58) · Android / iOS
* **Package Asset:** `LingoLens_v1.1.0_Ready_To_Use.zip`
* **Core Focus:** Turn a one-shot scan into a learning loop: first-run intro, an original mascot, a searchable library, spaced-repetition review and a shareable word card. Still 100% free, keyless and account-free.

### What's new in 1.1.0

1. **First-run intro (3 steps)**:
   - Explains the camera flow, the five languages and the review loop before asking for any permission.
   - Previews the mascot and the demo, with a **Skip** option.
   - The camera permission is requested only when the user actually takes a photo.

2. **Kamu, the original mascot**:
   - A one-eyed chameleon drawn entirely in SVG (`react-native-svg`) — no image assets and no licensing.
   - Five expressions: `idle`, `confused`, `happy`, `smug` and `sleepy`; skin color changes per language.
   - Appears while the photo is analyzed with a *“What the heck is this?”* face, pointing at the object.
   - Reacts after saving, publishes, errors and review sessions.
   - Respects the system **Reduce Motion** setting.

3. **Library with search, filters and favorites**:
   - Search any word across the five languages.
   - Filter by category and show favorites only.
   - Tap any translation to hear it; star words for later.
   - Shows how many words are due for review.

4. **Spaced-repetition review**:
   - Sessions of up to 10 flashcards built from your own scans.
   - Three grades: **Again** (+1 XP), **Good** (+4 XP) and **Easy** (+6 XP).
   - SM-2-lite scheduler: failed cards return in 10 minutes, good/easy cards move to future days.
   - Session summary with cards reviewed, XP earned and accuracy.

5. **Shareable word card**:
   - Generates a branded PNG on the device (`react-native-view-shot`) and opens the system share sheet (`expo-sharing`).
   - No accounts, no uploads and no server: the image is created locally.
   - Available from the result screen and from every library entry.

6. **Daily word**:
   - A deterministic word of the day on the scan screen, with one-tap audio in English.
   - Tactile feedback (haptics) when saving, favoriting, revealing and grading.

7. **Accessibility pass**:
   - Accessibility labels and roles on the new interactive elements.
   - Reduced-motion support for the mascot.
   - Text scales with the system font size.

8. **Repository quality**:
   - The project is validated locally with `npx tsc --noEmit`, `npx expo lint` and `npx expo-doctor` before every release.
   - Market research and roadmap documentation in English.

### Known Limitations

- The feed is local; it is not shared across devices.
- The free AI service is best-effort and may be throttled or change without notice.
- TTS depends on the voice packs installed on the phone.
- Review scheduling is stored locally; it does not sync between devices.
- The share card uses the native share sheet: on some devices the available targets vary.
- Distributed through Expo Go; a signed APK/AAB via EAS Build is planned for a later version.

### How to Test This Version

```bash
npm install
npm start
```

Open Expo Go on your phone, scan the QR code and complete the 3-step intro. Then scan an object, save it, open **Library** and start a **Review** session.

---

## Version 1.0.0 (First public release)

* **Official Release Date:** October 28, 2026
* **Status:** Available & Active
* **Test channel:** Expo Go (SDK 58) · Android / iOS
* **Package Asset:** `LingoLens_v1.0.0_Ready_To_Use.zip`
* **Core Focus:** Keyless free object identification, five languages with real audio and written pronunciation, full gamification and a local social feed.

### Key Features in Version 1.0.0

1. **Free, keyless object identification**:
   - Vision engine cascading over OVHcloud AI Endpoints: Qwen2.5-VL-72B, Qwen3.8-27B, Qwen3.5-9B and Qwen3.6-27B.
   - No signup, no card and no API key. Anonymous tier limit: 2 requests per minute per IP.
   - Total budget of ~55 s with automatic retry across models.

2. **Local fallback that never blocks the app**:
   - Catalog of 18 objects with translations, phonetics, article and example sentence.
   - If the AI fails or is saturated, a clear notice appears together with a **Retry with AI** button.
   - **Offline mode** switch in Settings to use only the local catalog.

3. **Five languages with real audio and written pronunciation**:
   - Spanish, English, French, German and Italian.
   - Audio through the device voices via `expo-speech` (no cost).
   - Phonetic spelling for Spanish speakers, with the stressed syllable in capitals.

4. **Optimized for high-resolution photos**:
   - Downscaled to 1024 px and JPEG-compressed before upload.
   - Prevents out-of-memory crashes on phones with 50 MP cameras (Pixel 9 Pro XL).

5. **Gamification**:
   - XP for saving a word (+12 base, +2 per language) and for posting (+15 the first time, +6 afterwards).
   - 7 global ranks: Curious, Explorer, Traveler, Linguist, Polyglot, Ambassador and Legend.
   - Independent per-language ranks: Beginner, Chatterbox, Conversationalist, Fluent and Master.
   - 12 badges, daily streak and usage statistics.

6. **Local community**:
   - Feed with sample posts, likes and your own posts.
   - No accounts and no server: progress and feed are stored on the device with AsyncStorage.

7. **Voice diagnostics**:
   - Settings shows which languages have an installed voice, lets you test them and opens the system text-to-speech settings.

### Known Limitations

- The feed is local; it is not shared across devices.
- The free AI service is best-effort and may be throttled or change without notice.
- TTS depends on the voice packs installed on the phone.
- Distributed through Expo Go; a signed APK/AAB via EAS Build is planned for a later version.

### How to Test This Version

```bash
npm install
npm start
```

Open Expo Go on your phone, scan the QR code and accept the camera permission. If French, German or Italian voices are missing, install them from Settings → Device voices.

---

## Version History

| Version | Date | Summary |
|---|---|---|
| v1.1.0 | 2026-10-28 | Learning Loop: intro, Kamu mascot, library, spaced-repetition review, shareable card and daily word. |
| v1.0.0 | 2026-10-28 | First public release: keyless free AI, 5 languages, audio, gamification and local feed. |
