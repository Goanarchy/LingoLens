import * as Speech from 'expo-speech';

import { LANGUAGES, LANG_BY_CODE, type LangCode } from './languages';

export async function speakWord(text: string, lang: LangCode): Promise<void> {
  try {
    await Speech.stop();
    Speech.speak(text, {
      language: LANG_BY_CODE[lang]?.speech ?? 'en-US',
      rate: 0.82,
      pitch: 1,
      onError: () => undefined,
    });
  } catch {
    // El dispositivo puede no tener voces instaladas para ese idioma.
  }
}

export async function stopSpeaking(): Promise<void> {
  try {
    await Speech.stop();
  } catch {
    // sin acción
  }
}

/**
 * Comprueba si el teléfono tiene instalada al menos una voz por idioma.
 * En Android las voces se descargan aparte desde los ajustes de TTS.
 */
export async function getVoiceStatus(): Promise<Record<LangCode, boolean>> {
  const status = { es: true, en: true, fr: true, de: true, it: true } as Record<LangCode, boolean>;

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (voices.length === 0) return status;
    for (const language of LANGUAGES) {
      const prefix = language.code.toLowerCase();
      status[language.code] = voices.some((voice) =>
        (voice.language ?? '').toLowerCase().startsWith(prefix),
      );
    }
  } catch {
    // Si la consulta falla, dejamos todas como disponibles y probamos al hablar.
  }

  return status;
}
