import { LANG_BY_CODE, isLangCode, type LangCode } from './languages';
import type { Translation } from './types';

let ExpoSpeechRecognitionModule: {
  requestPermissionsAsync?: () => Promise<{ granted: boolean }>;
  start: (opts: {
    lang: string;
    interimResults?: boolean;
    continuous?: boolean;
    maxAlternatives?: number;
  }) => void;
  stop: () => void;
  addListener: (eventName: string, listener: (event: unknown) => void) => { remove: () => void };
} | null = null;

try {
  // Dynamically require so Expo Go never crashes when the native module is absent.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('expo-speech-recognition');
  const candidate = mod?.ExpoSpeechRecognitionModule ?? mod?.default ?? mod;
  if (candidate && typeof candidate.start === 'function') {
    ExpoSpeechRecognitionModule = candidate;
  }
} catch {
  ExpoSpeechRecognitionModule = null;
}

export type RecognitionMode = 'native-asr' | 'web-asr' | 'guided-voice';

export type RecognitionResult = {
  success: boolean;
  transcript: string;
  alternatives: string[];
  mode: RecognitionMode;
  durationMs?: number;
  error?: string;
};

export type SyllableStatus = {
  syllable: string;
  matched: boolean;
};

export type PronunciationEvaluation = {
  score: number;
  passed: boolean;
  points: number;
  feedback: string;
  syllables: SyllableStatus[];
};

/** Duolingo-grade pass threshold (75% phonetic/lexical similarity). */
export const PRONUNCIATION_PASS_THRESHOLD = 0.75;
export const PRONUNCIATION_XP_REWARD = 15;

/** Strips diacritics, tone marks, punctuation, and normalizes Unicode (NFKC). */
export function normalizeSpeechString(input: string): string {
  return (input || '')
    .normalize('NFKC')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!'"「」。、！？]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

/** Normalized Levenshtein similarity in the range [0, 1]. */
export function stringSimilarity(a: string, b: string): number {
  const s1 = normalizeSpeechString(a);
  const s2 = normalizeSpeechString(b);
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const len1 = s1.length;
  const len2 = s2.length;
  const dp: number[][] = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i += 1) dp[i][0] = i;
  for (let j = 0; j <= len2; j += 1) dp[0][j] = j;

  for (let i = 1; i <= len1; i += 1) {
    for (let j = 1; j <= len2; j += 1) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }

  const distance = dp[len1][len2];
  return Math.max(0, 1 - distance / Math.max(len1, len2));
}

/**
 * Compares a spoken transcript (or phonetic attempt) against all representations
 * of a target translation: native script (`word`), Latin `romanization` (Rōmaji,
 * Pinyin, Hindi transliteration), and `phonetic` syllables.
 */
export function comparePronunciation(
  transcript: string,
  target: Translation | string,
  tolerance = PRONUNCIATION_PASS_THRESHOLD,
): PronunciationEvaluation {
  const translation: Translation =
    typeof target === 'string'
      ? { code: 'en', word: target, romanization: target, phonetic: target }
      : target;

  const candidates = [
    translation.word,
    translation.romanization,
    translation.phonetic.replace(/-/g, ''),
  ].filter(Boolean);

  const rawSyllables = (translation.phonetic || translation.romanization || translation.word)
    .split(/[-\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const cleanTranscript = normalizeSpeechString(transcript);
  if (!cleanTranscript) {
    return {
      score: 0,
      passed: false,
      points: 0,
      feedback: 'No speech detected. Hold the mic and pronounce each syllable clearly.',
      syllables: rawSyllables.map((syllable) => ({ syllable, matched: false })),
    };
  }

  let bestScore = 0;
  for (const candidate of candidates) {
    const score = stringSimilarity(cleanTranscript, candidate);
    if (score > bestScore) bestScore = score;
  }

  const syllables: SyllableStatus[] = rawSyllables.map((syllable) => {
    const normSyl = normalizeSpeechString(syllable);
    const matched =
      bestScore >= 0.92 ||
      (normSyl.length > 0 && cleanTranscript.includes(normSyl)) ||
      stringSimilarity(cleanTranscript, normSyl) >= 0.72;
    return { syllable, matched };
  });

  const syllableHitRatio =
    syllables.length > 0
      ? syllables.filter((s) => s.matched).length / syllables.length
      : bestScore;

  const finalScore = Number(Math.max(bestScore, syllableHitRatio * 0.92).toFixed(2));
  const passed = finalScore >= tolerance;
  const points = passed ? PRONUNCIATION_XP_REWARD : 0;

  let feedback: string;
  if (finalScore >= 0.92) {
    feedback = 'Spot-on native cadence! Every syllable rang clear.';
  } else if (passed) {
    feedback = 'Good pronunciation! Validated and points awarded.';
  } else if (finalScore >= 0.5) {
    feedback = 'Close! Tap the turtle icon 🐢 to hear it slowly and watch the stressed syllable.';
  } else {
    feedback = 'Not quite matching yet. Listen once more and pronounce all syllables.';
  }

  return {
    score: finalScore,
    passed,
    points,
    feedback,
    syllables,
  };
}

/** True when a hardware/browser speech recognizer is directly available. */
export function hasHardwareSpeechRecognition(): boolean {
  if (ExpoSpeechRecognitionModule) return true;
  if (typeof window !== 'undefined') {
    const w = window as unknown as Record<string, unknown>;
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  }
  return false;
}

/**
 * Starts live speech recognition when supported by the runtime (Dev Build or Web).
 * In Expo Go (where custom native speech recognition isn't bundled), returns
 * `mode: 'guided-voice'` so the UI runs the interactive acoustic + syllable verifier.
 */
export async function recognizeSpeech(langCode: LangCode): Promise<RecognitionResult> {
  if (!langCode || !isLangCode(langCode)) {
    return {
      success: false,
      transcript: '',
      alternatives: [],
      mode: 'guided-voice',
      error: 'Invalid language code.',
    };
  }

  const locale = LANG_BY_CODE[langCode]?.speech ?? 'en-US';

  if (ExpoSpeechRecognitionModule) {
    try {
      if (ExpoSpeechRecognitionModule.requestPermissionsAsync) {
        const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!perm.granted) {
          return {
            success: false,
            transcript: '',
            alternatives: [],
            mode: 'native-asr',
            error: 'Microphone permission denied.',
          };
        }
      }

      return await new Promise<RecognitionResult>((resolve) => {
        let settled = false;
        const finish = (res: RecognitionResult) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          try {
            unsubResult?.remove();
            unsubError?.remove();
          } catch {
            // Ignore cleanup errors
          }
          resolve(res);
        };

        const timeout = setTimeout(() => {
          try {
            ExpoSpeechRecognitionModule?.stop();
          } catch {
            // Ignore
          }
          finish({
            success: false,
            transcript: '',
            alternatives: [],
            mode: 'native-asr',
            error: 'Timed out waiting for voice input.',
          });
        }, 7000);

        const unsubResult = ExpoSpeechRecognitionModule.addListener('result', (event: unknown) => {
          const ev = event as {
            results?: { transcript?: string }[];
            isFinal?: boolean;
          };
          const list = Array.isArray(ev?.results) ? ev.results : [];
          const alternatives = list
            .map((r) => (r?.transcript ?? '').trim())
            .filter(Boolean);
          const transcript = alternatives[0] ?? '';
          if (transcript) {
            try {
              ExpoSpeechRecognitionModule?.stop();
            } catch {
              // Ignore
            }
            finish({
              success: true,
              transcript,
              alternatives,
              mode: 'native-asr',
            });
          }
        });

        const unsubError = ExpoSpeechRecognitionModule.addListener('error', (event: unknown) => {
          const ev = event as { message?: string };
          try {
            ExpoSpeechRecognitionModule?.stop();
          } catch {
            // Ignore
          }
          finish({
            success: false,
            transcript: '',
            alternatives: [],
            mode: 'native-asr',
            error: ev?.message || 'Speech recognition error.',
          });
        });

        ExpoSpeechRecognitionModule.start({
          lang: locale,
          continuous: false,
          interimResults: false,
          maxAlternatives: 4,
        });
      });
    } catch {
      // Fall through to guided voice mode
    }
  }

  return {
    success: false,
    transcript: '',
    alternatives: [],
    mode: 'guided-voice',
    error: 'Expo Go guided acoustic & syllable verification active.',
  };
}

export function evaluatePronunciationPoints(
  transcript: string,
  expectedTarget: Translation | string,
  _langCode: LangCode,
): PronunciationEvaluation {
  return comparePronunciation(transcript, expectedTarget, PRONUNCIATION_PASS_THRESHOLD);
}
