import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { seedPosts } from '@/data/seed';
import { countLanguages, evaluateBadges, type BadgeContext } from '@/lib/gamification';
import { DEFAULT_LANGS, type LangCode } from '@/lib/languages';
import { gradeReview, REVIEW_XP } from '@/lib/srs';
import type {
  LearnedWord,
  PendingScan,
  Post,
  PostOutcome,
  RegisterOutcome,
  ReviewGrade,
  ReviewState,
  ScanResult,
  Stats,
} from '@/lib/types';

const EMPTY_STATS: Stats = {
  audioPlays: 0,
  likesGiven: 0,
  postsCreated: 0,
  streak: 0,
  lastActiveDay: null,
};

type RegisterInput = ScanResult & { langs?: LangCode[] };

export type AppState = {
  hydrated: boolean;
  onboarded: boolean;
  offlineMode: boolean;
  displayName: string;
  langs: LangCode[];
  xp: number;
  learned: LearnedWord[];
  badges: Record<string, string>;
  posts: Post[];
  stats: Stats;
  reviews: Record<string, ReviewState>;
  pendingScan: PendingScan | null;

  setHydrated: () => void;
  completeOnboarding: () => void;
  setOfflineMode: (value: boolean) => void;
  setDisplayName: (value: string) => void;
  setPendingScan: (scan: PendingScan | null) => void;
  clearPendingScan: () => void;

  registerWord: (result: RegisterInput) => RegisterOutcome;
  toggleFavorite: (wordId: string) => void;
  gradeWord: (wordId: string, grade: ReviewGrade) => { xpGained: number; newBadges: string[] };
  toggleLike: (postId: string) => void;
  addPost: (result: ScanResult, caption?: string) => PostOutcome;
  countAudio: () => void;
  resetProgress: () => void;
};

function dayKey(date = new Date()): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function isYesterday(key: string | null): boolean {
  if (!key) return false;
  const [year, month, day] = key.split('-').map(Number);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return year === yesterday.getFullYear() && month === yesterday.getMonth() + 1 && day === yesterday.getDate();
}

/** Marca el día de hoy como activo y actualiza la racha si corresponde. */
function touchDay(stats: Stats): Stats {
  const today = dayKey();
  if (stats.lastActiveDay === today) return stats;
  const streak = isYesterday(stats.lastActiveDay) ? stats.streak + 1 : 1;
  return { ...stats, streak, lastActiveDay: today };
}

function badgeContext(state: {
  learned: LearnedWord[];
  xp: number;
  stats: Stats;
  posts: Post[];
}): BadgeContext {
  const words = state.learned.length;
  const langs = countLanguages(state.learned.map((entry) => entry.words));
  return {
    words,
    langs,
    audioPlays: state.stats.audioPlays,
    posts: state.posts.filter((post) => post.mine).length,
    streak: state.stats.streak,
    xp: state.xp,
  };
}

function unlockBadges(
  unlocked: Record<string, string>,
  ctx: BadgeContext,
): { badges: Record<string, string>; newBadges: string[] } {
  const newBadges = evaluateBadges(ctx, unlocked);
  if (newBadges.length === 0) return { badges: unlocked, newBadges };
  const badges = { ...unlocked };
  const now = new Date().toISOString();
  newBadges.forEach((id) => {
    badges[id] = now;
  });
  return { badges, newBadges };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      offlineMode: false,
      displayName: 'Explorador',
      langs: DEFAULT_LANGS,
      xp: 0,
      learned: [],
      badges: {},
      posts: seedPosts(),
      stats: EMPTY_STATS,
      reviews: {},
      pendingScan: null,

      setHydrated: () => set({ hydrated: true }),
      completeOnboarding: () => set({ onboarded: true }),
      setOfflineMode: (value) => set({ offlineMode: value }),
      setDisplayName: (value) => set({ displayName: value.trim().slice(0, 24) || 'Explorador' }),
      setPendingScan: (scan) => set({ pendingScan: scan }),
      clearPendingScan: () => set({ pendingScan: null }),

      registerWord: (result) => {
        const state = get();
        const key = result.object.trim().toLowerCase();
        const duplicate = state.learned.some((entry) => entry.object.trim().toLowerCase() === key);

        if (duplicate) {
          return { xpGained: 0, newBadges: [], duplicate: true };
        }

        const words: Record<string, string> = {};
        result.translations.forEach((translation) => {
          words[translation.code] = translation.word;
        });

        const entry: LearnedWord = {
          id: `word-${Date.now()}`,
          object: result.object,
          emoji: result.emoji,
          category: result.category,
          words,
          createdAt: new Date().toISOString(),
        };

        const learned = [entry, ...state.learned];
        const xpGained = 12 + result.translations.length * 2;
        const xp = state.xp + xpGained;
        const stats = touchDay(state.stats);
        const ctx = badgeContext({ learned, xp, stats, posts: state.posts });
        const { badges, newBadges } = unlockBadges(state.badges, ctx);

        set({
          learned,
          xp,
          stats,
          badges,
          reviews: { ...state.reviews, [entry.id]: { interval: 0, ease: 2.5, due: entry.createdAt, reps: 0, lapses: 0 } },
        });
        return { xpGained, newBadges, duplicate: false };
      },

      toggleFavorite: (wordId) => {
        set({
          learned: get().learned.map((word) =>
            word.id === wordId ? { ...word, favorite: !word.favorite } : word,
          ),
        });
      },

      gradeWord: (wordId, grade) => {
        const state = get();
        const word = state.learned.find((entry) => entry.id === wordId);
        if (!word) return { xpGained: 0, newBadges: [] };

        const reviews = { ...state.reviews, [wordId]: gradeReview(state.reviews[wordId], grade) };
        const xpGained = REVIEW_XP[grade];
        const xp = state.xp + xpGained;
        const stats = touchDay(state.stats);
        const ctx = badgeContext({ learned: state.learned, xp, stats, posts: state.posts });
        const { badges, newBadges } = unlockBadges(state.badges, ctx);

        set({ reviews, xp, stats, badges });
        return { xpGained, newBadges };
      },

      toggleLike: (postId) => {
        let likesGiven = get().stats.likesGiven;
        const posts = get().posts.map((post) => {
          if (post.id !== postId) return post;
          likesGiven += post.likedByMe ? -1 : 1;
          return {
            ...post,
            likedByMe: !post.likedByMe,
            likes: Math.max(0, post.likes + (post.likedByMe ? -1 : 1)),
          };
        });
        set({ posts, stats: { ...get().stats, likesGiven: Math.max(0, likesGiven) } });
      },

      addPost: (result, caption) => {
        const state = get();
        const name = state.displayName || 'Explorador';
        const mineCount = state.posts.filter((post) => post.mine).length;
        const post: Post = {
          id: `post-${Date.now()}`,
          author: name,
          initials: name.slice(0, 2).toUpperCase(),
          avatarColor: '#8CFFB8',
          object: result.object,
          emoji: result.emoji,
          category: result.category,
          words: result.translations,
          likes: 0,
          likedByMe: false,
          mine: true,
          caption,
          createdAt: new Date().toISOString(),
        };

        const posts = [post, ...state.posts];
        const stats: Stats = { ...state.stats, postsCreated: state.stats.postsCreated + 1 };
        const xpGained = mineCount === 0 ? 15 : 6;
        const xp = state.xp + xpGained;
        const ctx = badgeContext({ learned: state.learned, xp, stats, posts });
        const { badges, newBadges } = unlockBadges(state.badges, ctx);

        set({ posts, stats, xp, badges });
        return { xpGained, newBadges };
      },

      countAudio: () => {
        const state = get();
        const stats: Stats = { ...state.stats, audioPlays: state.stats.audioPlays + 1 };
        const ctx = badgeContext({ ...state, stats });
        const { badges } = unlockBadges(state.badges, ctx);
        set({ stats, badges });
      },

      resetProgress: () =>
        set({
          xp: 0,
          learned: [],
          badges: {},
          posts: seedPosts(),
          stats: EMPTY_STATS,
          reviews: {},
          pendingScan: null,
        }),
    }),
    {
      name: 'lingolens-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboarded: state.onboarded,
        offlineMode: state.offlineMode,
        displayName: state.displayName,
        langs: state.langs,
        xp: state.xp,
        learned: state.learned,
        badges: state.badges,
        posts: state.posts,
        stats: state.stats,
        reviews: state.reviews,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
