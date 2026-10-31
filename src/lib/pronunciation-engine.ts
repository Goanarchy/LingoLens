import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import type { LangCode } from './languages';
import {
  PRONUNCIATION_PASS_THRESHOLD,
  comparePronunciation,
  recognizeSpeech,
  type PronunciationEvaluation,
  type SyllableStatus,
} from './speech-recognition';
import type { Translation } from './types';

export type PronunciationAttempt = {
  transcript: string;
  score: number;
  passed: boolean;
  feedback: string;
  syllables: SyllableStatus[];
};

export type PronunciationSession = {
  attemptsLeft: number;
  maxAttempts: number;
  attempts: PronunciationAttempt[];
  completed: boolean;
  passed: boolean;
  bestScore: number;
  pointsAwarded: number;
};

export const MAX_PRONUNCIATION_ATTEMPTS = 3;

function triggerHaptic(passed: boolean) {
  if (Platform.OS === 'web') return;
  if (passed) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  } else {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  }
}

/**
 * Evaluates a single pronunciation attempt (either from live ASR or from the
 * Expo Go acoustic hold-to-speak + phonetic syllable check).
 *
 * Enforces Duolingo's pedagogical standards:
 * - Minimum acoustic hold duration check when using the microphone hold gesture
 * - Normalized similarity >= 75% across native script, romanization, or phonetics
 * - Up to 3 attempts per session; points are awarded ONLY if validated as passed.
 */
export function evaluateSingleAttempt(
  translation: Translation,
  spokenOrSelectedText: string,
  holdDurationMs = 1100,
): PronunciationEvaluation {
  const minDurationMs = Math.max(550, Math.min(1400, translation.phonetic.split('-').length * 260));
  if (holdDurationMs > 0 && holdDurationMs < minDurationMs) {
    const rawSyllables = (translation.phonetic || translation.romanization || translation.word)
      .split(/[-\s]+/)
      .filter(Boolean);
    triggerHaptic(false);
    return {
      score: 0.25,
      passed: false,
      points: 0,
      feedback: 'Hold the mic button while speaking the full word—that was too brief!',
      syllables: rawSyllables.map((syllable) => ({ syllable, matched: false })),
    };
  }

  const evaluation = comparePronunciation(
    spokenOrSelectedText,
    translation,
    PRONUNCIATION_PASS_THRESHOLD,
  );
  triggerHaptic(evaluation.passed);
  return evaluation;
}

/**
 * Generates a realistic Duolingo-style phonetic syllable puzzle for a target
 * translation so Expo Go users can both speak into the mic AND verify the exact
 * syllable sequence (preventing blind button-mashing for free points).
 */
export function buildPhoneticChoices(translation: Translation): string[] {
  const correct = translation.phonetic || translation.romanization || translation.word;
  const parts = correct.split('-').map((p) => p.trim()).filter(Boolean);

  let distractor1: string;
  let distractor2: string;

  if (parts.length >= 2) {
    distractor1 = [parts[1], parts[0], ...parts.slice(2)].join('-');
    distractor2 = parts
      .map((p, idx) => (idx === 0 ? `${p}o` : p.replace(/[aeiou]/i, 'u')))
      .join('-');
  } else {
    const base = correct.toLowerCase();
    distractor1 = `${base.slice(0, Math.max(1, base.length - 1))}ton`;
    distractor2 = `ka-${base}`;
  }

  if (distractor1.toLowerCase() === correct.toLowerCase()) {
    distractor1 = `${correct}-na`;
  }
  if (
    distractor2.toLowerCase() === correct.toLowerCase() ||
    distractor2.toLowerCase() === distractor1.toLowerCase()
  ) {
    distractor2 = `${correct.slice(0, 2)}-${correct}`;
  }

  const list = [correct, distractor1, distractor2];
  // Deterministic shuffle seeded by character codes
  const seed = correct.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return list
    .map((item, idx) => ({ item, sortKey: (seed + idx * 37) % 101 }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((entry) => entry.item);
}

/**
 * Legacy helper preserved for compatibility: runs a hardware ASR check when
 * available and returns the structured session.
 */
export async function startPronunciationSession(
  targetWord: Translation | string,
  langCode: LangCode,
): Promise<{ session: PronunciationSession; outcome: 'passed' | 'failed' | 'guided-needed' }> {
  const translation: Translation =
    typeof targetWord === 'string'
      ? { code: langCode, word: targetWord, romanization: targetWord, phonetic: targetWord }
      : targetWord;

  const result = await recognizeSpeech(langCode);
  if (result.mode === 'guided-voice' && !result.success) {
    return {
      session: {
        attemptsLeft: MAX_PRONUNCIATION_ATTEMPTS,
        maxAttempts: MAX_PRONUNCIATION_ATTEMPTS,
        attempts: [],
        completed: false,
        passed: false,
        bestScore: 0,
        pointsAwarded: 0,
      },
      outcome: 'guided-needed',
    };
  }

  const candidates = [result.transcript, ...result.alternatives].filter(Boolean);
  let bestEval = evaluateSingleAttempt(translation, candidates[0] ?? '', 1200);
  for (const alt of candidates.slice(1)) {
    const ev = evaluateSingleAttempt(translation, alt, 1200);
    if (ev.score > bestEval.score) bestEval = ev;
  }

  const attempt: PronunciationAttempt = {
    transcript: result.transcript,
    score: bestEval.score,
    passed: bestEval.passed,
    feedback: bestEval.feedback,
    syllables: bestEval.syllables,
  };

  return {
    session: {
      attemptsLeft: MAX_PRONUNCIATION_ATTEMPTS - 1,
      maxAttempts: MAX_PRONUNCIATION_ATTEMPTS,
      attempts: [attempt],
      completed: bestEval.passed,
      passed: bestEval.passed,
      bestScore: bestEval.score,
      pointsAwarded: bestEval.points,
    },
    outcome: bestEval.passed ? 'passed' : 'failed',
  };
}
