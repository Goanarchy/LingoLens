import type { LearnedWord, ReviewGrade, ReviewState } from './types';

const DAY_MS = 86_400_000;
const MIN_EASE = 1.3;
const MAX_EASE = 3.2;

function iso(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/** Initial state: a newly saved word is immediately eligible for review. */
export function initialReview(now = Date.now()): ReviewState {
  return { interval: 0, ease: 2.5, due: iso(now), reps: 0, lapses: 0 };
}

export function isDue(state: ReviewState, now = Date.now()): boolean {
  const due = new Date(state.due).getTime();
  return Number.isFinite(due) ? due <= now : true;
}

/**
 * Lightweight SM-2 spaced-repetition scheduler.
 *
 * - `again`: returns to today's queue and lowers ease.
 * - `good`: multiplies the interval by the ease factor.
 * - `easy`: multiplies by ease plus a 30% bonus.
 */
export function gradeReview(
  current: ReviewState | undefined,
  grade: ReviewGrade,
  now = Date.now(),
): ReviewState {
  const base = current ?? initialReview(now);
  let ease = base.ease;
  let interval = base.interval;
  let lapses = base.lapses;
  let reps = base.reps + 1;

  if (grade === 'again') {
    ease = Math.max(MIN_EASE, ease - 0.2);
    interval = 0;
    lapses += 1;
    reps = 1;
  } else if (grade === 'good') {
    interval = interval === 0 ? 1 : Math.max(1, Math.round(interval * ease));
  } else {
    ease = Math.min(MAX_EASE, ease + 0.12);
    interval = interval === 0 ? 2 : Math.max(2, Math.round(interval * ease * 1.3));
  }

  const due = grade === 'again' ? now + 10 * 60 * 1000 : now + interval * DAY_MS;
  return { interval, ease, due: iso(due), reps, lapses };
}

/** XP awarded per flashcard grade during a review session. */
export const REVIEW_XP: Record<ReviewGrade, number> = {
  again: 1,
  good: 4,
  easy: 6,
};

export type DueWord = {
  word: LearnedWord;
  state: ReviewState;
};

/** Returns words currently due for review, ordered most overdue first. */
export function dueWords(
  words: LearnedWord[],
  reviews: Record<string, ReviewState>,
  now = Date.now(),
): DueWord[] {
  return words
    .map((word) => ({
      word,
      state: reviews[word.id] ?? initialReview(new Date(word.createdAt).getTime()),
    }))
    .filter(({ state }) => isDue(state, now))
    .sort((a, b) => new Date(a.state.due).getTime() - new Date(b.state.due).getTime());
}

/** Count of words ready for review right now. */
export function countDue(
  words: LearnedWord[],
  reviews: Record<string, ReviewState>,
  now = Date.now(),
): number {
  return dueWords(words, reviews, now).length;
}

/** Builds a review session of up to `size` cards. */
export function buildSession(
  words: LearnedWord[],
  reviews: Record<string, ReviewState>,
  size = 10,
  now = Date.now(),
): DueWord[] {
  const due = dueWords(words, reviews, now);
  if (due.length >= size) return due.slice(0, size);
  const seen = new Set(due.map((entry) => entry.word.id));
  const extra = words
    .filter((word) => !seen.has(word.id))
    .map((word) => ({
      word,
      state: reviews[word.id] ?? initialReview(new Date(word.createdAt).getTime()),
    }));
  return [...due, ...extra].slice(0, size);
}
