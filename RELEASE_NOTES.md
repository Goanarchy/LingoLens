# Release Notes & Version History

**LingoLens — One photo, five languages**
*GitHub Repository: [github.com/Goanarchy/LingoLens](https://github.com/Goanarchy/LingoLens)*

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
| v1.0.0 | 2026-10-28 | First public release: keyless free AI, 5 languages, audio, gamification and local feed. |
