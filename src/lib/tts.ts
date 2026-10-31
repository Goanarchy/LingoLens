import * as Speech from 'expo-speech';

import { ALL_LANGS, LANGUAGES, LANG_BY_CODE, type LangCode } from './languages';

/**
 * Native device Text-to-Speech wrapper optimized for Google TTS on Pixel 9 Pro XL.
 *
 * Supports normal conversational speed (0.85x) and a Duolingo-style slow
 * "turtle" speed (0.52x) so learners can hear every syllable in Spanish,
 * English, Japanese, Hindi, and Mandarin.
 */
export const SPEECH_RATE_NORMAL = 0.85;
export const SPEECH_RATE_SLOW = 0.52;

function pickVoiceByLanguage(voices: Speech.Voice[], langCode: string): Speech.Voice | null {
  const prefix = langCode.toLowerCase().split('-')[0] || '';
  const candidates = voices.filter((v) => (v.language ?? '').toLowerCase().startsWith(prefix));
  if (candidates.length === 0) return null;
  const exact = candidates.find((v) => (v.language ?? '').toLowerCase() === langCode.toLowerCase());
  return exact ?? candidates[0];
}

export async function speakWord(
  text: string,
  lang: LangCode,
  opts: { slow?: boolean } = {},
): Promise<void> {
  try {
    await Speech.stop();
    const langMeta = LANG_BY_CODE[lang];
    const targetLang = langMeta?.speech ?? 'en-US';
    const rate = opts.slow ? SPEECH_RATE_SLOW : SPEECH_RATE_NORMAL;
    const options: Speech.SpeechOptions = {
      language: targetLang,
      rate,
      pitch: 1,
      volume: 1,
    };

    const voices = await Speech.getAvailableVoicesAsync();
    if (voices.length > 0) {
      const matched = pickVoiceByLanguage(voices, targetLang);
      if (matched) {
        options.voice = matched.identifier;
      }
    }

    Speech.speak(text, options);
  } catch {
    // Device may not have a TTS engine active; fail silently without crashing.
  }
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Speech.stop();
  } catch {
    // No-op
  }
}

/**
 * Checks whether the device has at least one native voice installed for each
 * of the 5 study languages (es, en, ja, hi, zh).
 */
export async function getVoiceStatus(): Promise<Record<LangCode, boolean>> {
  const status = ALL_LANGS.reduce<Record<LangCode, boolean>>(
    (acc, code) => {
      acc[code] = code === 'es' || code === 'en';
      return acc;
    },
    {} as Record<LangCode, boolean>,
  );

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (voices.length === 0) return status;
    for (const language of LANGUAGES) {
      const prefix = language.code.toLowerCase();
      const hasNative = voices.some((voice) =>
        (voice.language ?? '').toLowerCase().startsWith(prefix),
      );
      status[language.code] = hasNative;
    }
  } catch {
    // Keep conservative defaults if the TTS query fails.
  }

  return status;
}
