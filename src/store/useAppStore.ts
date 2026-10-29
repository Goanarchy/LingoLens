import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { seedPosts } from '@/data/seed';
import { countLanguages, evaluateBadges, type BadgeContext } from '@/lib/gamification';
import { DEFAULT_LANGS, type LangCode } from '@/lib/languages';
import type {
  LearnedWord,
  PendingScan,
  Post,
  PostOutcome,
  RegisterOutcome,
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
  offlineMode: boolean;
  displayName: string;
  langs: LangCode[];
  xp: number;
  learned: LearnedWord[];
  badges: Record<string, string>;
  posts: Post[];
  stats: Stats;
  pendingScan: PendingScan | null;

  setHydrated: () => void;
  setOfflineMode: (value: boolean) => void;
  setDisplayName: (value: string) => void;
  setPendingScan: (scan: PendingScan | null) => void;
  clearPendingScan: () => void;

  registerWord: (result: RegisterInput) => RegisterOutcome;
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
      offlineMode: false,
      displayName: 'Explorador',
      langs: DEFAULT_LANGS,
      xp: 0,
      learned: [],
      badges: {},
      posts: seedPosts(),
      stats: EMPTY_STATS,
      pendingScan: null,

      setHydrated: () => set({ hydrated: true }),
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

        const today = dayKey();
        const streak =
          state.stats.lastActiveDay === today
            ? state.stats.streak || 1
            : isYesterday(state.stats.lastActiveDay)
              ? state.stats.streak + 1
              : 1;

        const learned = [entry, ...state.learned];
        const xpGained = 12 + result.translations.length * 2;
        const xp = state.xp + xpGained;
        const stats: Stats = { ...state.stats, streak, lastActiveDay: today };
        const ctx = badgeContext({ learned, xp, stats, posts: state.posts });
        const { badges, newBadges } = unlockBadges(state.badges, ctx);

        set({ learned, xp, stats, badges });
        return { xpGained, newBadges, duplicate: false };
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
          pendingScan: null,
        }),
    }),
    {
      name: 'lingolens-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        offlineMode: state.offlineMode,
        displayName: state.displayName,
        langs: state.langs,
        xp: state.xp,
        learned: state.learned,
        badges: state.badges,
        posts: state.posts,
        stats: state.stats,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
