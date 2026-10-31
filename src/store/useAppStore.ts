import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { seedPosts } from '@/data/seed';
import { getDailyWord } from '@/lib/demoCatalog';
import {
  STREAK_MILESTONES,
  countLanguages,
  evaluateBadges,
  rankForXp,
  type BadgeContext,
} from '@/lib/gamification';
import { ALL_LANGS, DEFAULT_LANGS, sanitizeLangs, type LangCode } from '@/lib/languages';
import { gradeReview, REVIEW_XP } from '@/lib/srs';
import type {
  CrownRecord,
  CrownTier,
  LearnedWord,
  PendingScan,
  PhotoOutcome,
  Post,
  PostOutcome,
  PronunciationOutcome,
  ReactionKind,
  RegisterOutcome,
  RewardEvent,
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
  photoStreak: 0,
  bestPhotoStreak: 0,
  lastPhotoDay: null,
  photosTaken: 0,
  pronunciationPasses: 0,
  pronunciationAttempts: 0,
};

const EMPTY_SCOREBOARD: Record<LangCode, number> = {
  es: 0,
  en: 0,
  ja: 0,
  hi: 0,
  zh: 0,
};

type RegisterInput = ScanResult & { photoUri?: string };

export type AppState = {
  hydrated: boolean;
  onboarded: boolean;
  offlineMode: boolean;
  displayName: string;
  learnLang: LangCode;
  learningLangs: LangCode[];
  interfaceLang: 'en';
  scoreboard: Record<LangCode, number>;
  profileCompleted: boolean;
  langs: LangCode[];
  xp: number;
  learned: LearnedWord[];
  badges: Record<string, string>;
  unlockedMilestones: Record<string, string>;
  crowns: CrownRecord[];
  pronunciationPassedKeys: Record<string, boolean>;
  posts: Post[];
  stats: Stats;
  reviews: Record<string, ReviewState>;
  pendingScan: PendingScan | null;
  demoTargetObject: string | null;

  setHydrated: () => void;
  completeOnboarding: () => void;
  setOfflineMode: (value: boolean) => void;
  setDisplayName: (value: string) => void;
  setLearnLang: (value: LangCode) => void;
  setLearningLangs: (value: LangCode[]) => void;
  toggleLearningLang: (code: LangCode) => void;
  completeProfile: () => void;
  setPendingScan: (scan: PendingScan | null) => void;
  clearPendingScan: () => void;
  setDemoTargetObject: (objectName: string | null) => void;

  recordPhotoCapture: (result: ScanResult) => PhotoOutcome;
  recordPronunciationAttempt: (
    object: string,
    lang: LangCode,
    passed: boolean,
    points: number,
    isDailyMatch?: boolean,
  ) => PronunciationOutcome;
  registerWord: (result: RegisterInput) => RegisterOutcome;
  toggleFavorite: (wordId: string) => void;
  gradeWord: (wordId: string, grade: ReviewGrade) => { xpGained: number; newBadges: string[] };
  toggleLike: (postId: string) => void;
  toggleReaction: (postId: string, kind: ReactionKind) => void;
  addPost: (result: ScanResult, caption?: string) => PostOutcome;
  countAudio: () => void;
  simulateStreakMilestone: (days: 7 | 14 | 21) => {
    xpGained: number;
    milestoneName: string;
    newBadges: string[];
  };
  resetProgress: () => void;
};

export function dayKey(date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function isYesterday(key: string | null): boolean {
  if (!key) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return key === dayKey(yesterday);
}

/** Updates general learning streak for today. */
function touchDay(stats: Stats): Stats {
  const today = dayKey();
  if (stats.lastActiveDay === today) return stats;
  const streak = isYesterday(stats.lastActiveDay) ? stats.streak + 1 : Math.max(1, stats.streak);
  return { ...stats, streak, lastActiveDay: today };
}

/** Updates daily photo streak when a photo is captured and analyzed. */
function touchPhotoDay(stats: Stats): Stats {
  const today = dayKey();
  const base = touchDay(stats);
  const photosTaken = base.photosTaken + 1;
  if (base.lastPhotoDay === today) {
    return { ...base, photosTaken };
  }
  const photoStreak = isYesterday(base.lastPhotoDay)
    ? base.photoStreak + 1
    : Math.max(1, base.photoStreak);
  const bestPhotoStreak = Math.max(base.bestPhotoStreak, photoStreak);
  return {
    ...base,
    photosTaken,
    photoStreak,
    bestPhotoStreak,
    streak: Math.max(base.streak, photoStreak),
    lastPhotoDay: today,
  };
}

function badgeContext(state: {
  learned: LearnedWord[];
  xp: number;
  stats: Stats;
  posts: Post[];
  crowns: CrownRecord[];
}): BadgeContext {
  const words = state.learned.length;
  const langs = countLanguages(state.learned.map((entry) => entry.words));
  return {
    words,
    langs,
    audioPlays: state.stats.audioPlays,
    posts: state.posts.filter((post) => post.mine).length,
    streak: state.stats.streak,
    photoStreak: state.stats.photoStreak,
    crowns: state.crowns.length,
    pronunciationPasses: state.stats.pronunciationPasses,
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
      onboarded: true,
      offlineMode: false,
      displayName: 'Explorer',
      learnLang: 'es',
      learningLangs: [...DEFAULT_LANGS],
      interfaceLang: 'en',
      scoreboard: { ...EMPTY_SCOREBOARD },
      profileCompleted: true,
      langs: [...DEFAULT_LANGS],
      xp: 0,
      learned: [],
      badges: {},
      unlockedMilestones: {},
      crowns: [],
      pronunciationPassedKeys: {},
      posts: seedPosts(),
      stats: { ...EMPTY_STATS },
      reviews: {},
      pendingScan: null,
      demoTargetObject: null,

      setHydrated: () => set({ hydrated: true }),
      completeOnboarding: () => set({ onboarded: true }),
      setOfflineMode: (value) => set({ offlineMode: value }),
      setDisplayName: (value) => set({ displayName: value.trim().slice(0, 24) || 'Explorer' }),
      setLearnLang: (value) => set({ learnLang: value }),
      setLearningLangs: (value) => {
        const clean = sanitizeLangs(value);
        set({ learningLangs: clean, langs: clean, learnLang: clean[0] ?? 'es' });
      },
      toggleLearningLang: (code) => {
        const current = sanitizeLangs(get().learningLangs);
        const exists = current.includes(code);
        let next: LangCode[];
        if (exists) {
          if (current.length <= 1) return; // Always keep at least 1 active language
          next = current.filter((c) => c !== code);
        } else {
          next = ALL_LANGS.filter((c) => c === code || current.includes(c));
        }
        set({ learningLangs: next, langs: next, learnLang: next[0] ?? 'es' });
      },
      completeProfile: () => set({ profileCompleted: true }),
      setPendingScan: (scan) => set({ pendingScan: scan }),
      clearPendingScan: () => set({ pendingScan: null }),
      setDemoTargetObject: (objectName) => set({ demoTargetObject: objectName }),

      recordPhotoCapture: (result) => {
        const state = get();
        const stats = touchPhotoDay(state.stats);
        const events: RewardEvent[] = [];
        let xpGained = 10;
        events.push({ kind: 'xp', amount: 10, label: 'Photo analyzed' });

        const today = dayKey();
        let crowns = [...state.crowns];
        let crownEarned: CrownTier | null = null;

        if (result.dailyMatch?.matched) {
          const existingIndex = crowns.findIndex((c) => c.day === today);
          if (existingIndex === -1) {
            const daily = getDailyWord();
            const newCrown: CrownRecord = {
              day: today,
              tier: 'bronze',
              object: result.object,
              dailyWord: daily.object,
              earnedAt: new Date().toISOString(),
            };
            crowns = [newCrown, ...crowns];
            crownEarned = 'bronze';
            xpGained += 25;
            events.push({ kind: 'crown', tier: 'bronze' });
            events.push({ kind: 'xp', amount: 25, label: 'Word of the Day Crown' });
          } else {
            crownEarned = crowns[existingIndex].tier;
          }
        }

        const unlockedMilestones = { ...state.unlockedMilestones };
        const newTrophies: string[] = [];
        const nowIso = new Date().toISOString();

        for (const milestone of STREAK_MILESTONES) {
          if (
            stats.photoStreak >= milestone.daysRequired &&
            !unlockedMilestones[milestone.id]
          ) {
            unlockedMilestones[milestone.id] = nowIso;
            newTrophies.push(milestone.id);
            xpGained += milestone.xpBonus;
            events.push({ kind: 'trophy', trophyId: milestone.id });
            events.push({
              kind: 'xp',
              amount: milestone.xpBonus,
              label: milestone.name,
            });
          }
        }

        const xp = state.xp + xpGained;
        const ctx = badgeContext({
          learned: state.learned,
          xp,
          stats,
          posts: state.posts,
          crowns,
        });
        const { badges, newBadges } = unlockBadges(state.badges, ctx);
        newBadges.forEach((badgeId) => events.push({ kind: 'badge', badgeId }));

        set({
          xp,
          stats,
          crowns,
          unlockedMilestones,
          badges,
        });

        return {
          xpGained,
          events,
          photoStreak: stats.photoStreak,
          crown: crownEarned,
          newTrophies,
          newBadges,
        };
      },

      recordPronunciationAttempt: (object, lang, passed, points, isDailyMatch) => {
        const state = get();
        const key = `${object.trim().toLowerCase()}:${lang}`;
        const alreadyPassed = Boolean(state.pronunciationPassedKeys[key]);

        const stats: Stats = {
          ...state.stats,
          pronunciationAttempts: state.stats.pronunciationAttempts + 1,
          pronunciationPasses:
            passed && !alreadyPassed
              ? state.stats.pronunciationPasses + 1
              : state.stats.pronunciationPasses,
        };

        if (!passed) {
          set({ stats });
          return { xpGained: 0, firstPass: false, newBadges: [] };
        }

        const xpGained = alreadyPassed ? 3 : Math.max(5, points);
        const xp = state.xp + xpGained;
        const scoreboard = {
          ...state.scoreboard,
          [lang]: (state.scoreboard[lang] ?? 0) + xpGained,
        };
        const pronunciationPassedKeys = {
          ...state.pronunciationPassedKeys,
          [key]: true,
        };

        let crowns = state.crowns;
        if (isDailyMatch) {
          const today = dayKey();
          crowns = state.crowns.map((c) =>
            c.day === today ? { ...c, tier: 'gold' as CrownTier } : c,
          );
        }

        const ctx = badgeContext({
          learned: state.learned,
          xp,
          stats,
          posts: state.posts,
          crowns,
        });
        const { badges, newBadges } = unlockBadges(state.badges, ctx);

        set({
          xp,
          scoreboard,
          stats,
          pronunciationPassedKeys,
          crowns,
          badges,
        });

        return { xpGained, firstPass: !alreadyPassed, newBadges };
      },

      registerWord: (result) => {
        const state = get();
        const key = result.object.trim().toLowerCase();
        const duplicate = state.learned.some((entry) => entry.object.trim().toLowerCase() === key);

        if (duplicate) {
          return { xpGained: 0, newBadges: [], duplicate: true };
        }

        const words: Partial<Record<LangCode, string>> = {};
        const romanizations: Partial<Record<LangCode, string>> = {};
        result.translations.forEach((translation) => {
          words[translation.code] = translation.word;
          if (translation.romanization && translation.romanization !== translation.word) {
            romanizations[translation.code] = translation.romanization;
          }
        });

        const entry: LearnedWord = {
          id: `word-${Date.now()}`,
          object: result.object,
          emoji: result.emoji,
          category: result.category,
          words,
          romanizations,
          createdAt: new Date().toISOString(),
          photoUri: result.photoUri,
        };

        const learned = [entry, ...state.learned];
        const xpGained = 12 + result.translations.length * 2;
        const xp = state.xp + xpGained;
        const stats = touchDay(state.stats);

        let crowns = state.crowns;
        if (result.dailyMatch?.matched) {
          const today = dayKey();
          crowns = state.crowns.map((c) =>
            c.day === today && c.tier === 'bronze' ? { ...c, tier: 'silver' as CrownTier } : c,
          );
        }

        const ctx = badgeContext({ learned, xp, stats, posts: state.posts, crowns });
        const { badges, newBadges } = unlockBadges(state.badges, ctx);

        set({
          learned,
          xp,
          stats,
          crowns,
          badges,
          reviews: {
            ...state.reviews,
            [entry.id]: { interval: 0, ease: 2.5, due: entry.createdAt, reps: 0, lapses: 0 },
          },
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
        const ctx = badgeContext({
          learned: state.learned,
          xp,
          stats,
          posts: state.posts,
          crowns: state.crowns,
        });
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

      toggleReaction: (postId, kind) => {
        const posts = get().posts.map((post) => {
          if (post.id !== postId) return post;
          const myReactions = post.myReactions ?? [];
          const has = myReactions.includes(kind);
          const nextMine = has ? myReactions.filter((r) => r !== kind) : [...myReactions, kind];
          const baseCount = post.reactions?.[kind] ?? 0;
          return {
            ...post,
            myReactions: nextMine,
            reactions: {
              fire: post.reactions?.fire ?? 0,
              idea: post.reactions?.idea ?? 0,
              crown: post.reactions?.crown ?? 0,
              [kind]: Math.max(0, baseCount + (has ? -1 : 1)),
            },
          };
        });
        set({ posts });
      },

      addPost: (result, caption) => {
        const state = get();
        const name = state.displayName || 'Explorer';
        const mineCount = state.posts.filter((post) => post.mine).length;
        const rankInfo = rankForXp(state.xp);
        const post: Post = {
          id: `post-${Date.now()}`,
          author: name,
          initials: name.slice(0, 2).toUpperCase(),
          avatarColor: '#8CFFB8',
          object: result.object,
          emoji: result.emoji,
          category: result.category,
          words: result.translations,
          likes: 1,
          likedByMe: true,
          mine: true,
          caption:
            caption?.trim() ||
            (result.dailyMatch?.matched
              ? `Captured today's Word of the Day (${result.emoji} ${result.object}) in ${result.translations.length} languages! 👑`
              : `Discovered ${result.emoji} ${result.object} with LingoLens!`),
          createdAt: new Date().toISOString(),
          authorStreak: Math.max(1, state.stats.photoStreak),
          authorCrowns: state.crowns.length,
          authorRank: `${rankInfo.rank.emoji} ${rankInfo.rank.name}`,
          dailyCatch: Boolean(result.dailyMatch?.matched),
          reactions: { fire: 1, idea: 0, crown: result.dailyMatch?.matched ? 1 : 0 },
          myReactions: ['fire'],
        };

        const posts = [post, ...state.posts];
        const stats: Stats = { ...state.stats, postsCreated: state.stats.postsCreated + 1 };
        const xpGained = mineCount === 0 ? 15 : 8;
        const xp = state.xp + xpGained;
        const ctx = badgeContext({
          learned: state.learned,
          xp,
          stats,
          posts,
          crowns: state.crowns,
        });
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

      simulateStreakMilestone: (days) => {
        const state = get();
        const today = dayKey();
        const photoStreak = Math.max(state.stats.photoStreak, days);
        const bestPhotoStreak = Math.max(state.stats.bestPhotoStreak, photoStreak);
        const stats: Stats = {
          ...state.stats,
          streak: Math.max(state.stats.streak, days),
          photoStreak,
          bestPhotoStreak,
          lastActiveDay: today,
          lastPhotoDay: today,
          photosTaken: Math.max(state.stats.photosTaken, days),
        };

        const unlockedMilestones = { ...state.unlockedMilestones };
        const nowIso = new Date().toISOString();
        let xpGained = 0;
        let milestoneName = `${days}-Day Streak`;

        for (const m of STREAK_MILESTONES) {
          if (photoStreak >= m.daysRequired) {
            milestoneName = m.name;
            if (!unlockedMilestones[m.id]) {
              unlockedMilestones[m.id] = nowIso;
              xpGained += m.xpBonus;
            }
          }
        }

        const xp = state.xp + xpGained;
        const ctx = badgeContext({
          learned: state.learned,
          xp,
          stats,
          posts: state.posts,
          crowns: state.crowns,
        });
        const { badges, newBadges } = unlockBadges(state.badges, ctx);

        set({ stats, unlockedMilestones, xp, badges });
        return { xpGained, milestoneName, newBadges };
      },

      resetProgress: () =>
        set({
          xp: 0,
          learned: [],
          badges: {},
          unlockedMilestones: {},
          crowns: [],
          pronunciationPassedKeys: {},
          scoreboard: { ...EMPTY_SCOREBOARD },
          posts: seedPosts(),
          stats: { ...EMPTY_STATS },
          reviews: {},
          pendingScan: null,
        }),
    }),
    {
      name: 'lingolens-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        onboarded: state.onboarded,
        offlineMode: state.offlineMode,
        displayName: state.displayName,
        learnLang: state.learnLang,
        learningLangs: state.learningLangs,
        interfaceLang: state.interfaceLang,
        scoreboard: state.scoreboard,
        profileCompleted: state.profileCompleted,
        langs: state.langs,
        xp: state.xp,
        learned: state.learned,
        badges: state.badges,
        unlockedMilestones: state.unlockedMilestones,
        crowns: state.crowns,
        pronunciationPassedKeys: state.pronunciationPassedKeys,
        posts: state.posts,
        stats: state.stats,
        reviews: state.reviews,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const clean = sanitizeLangs(state.learningLangs);
          state.setLearningLangs(clean);
          state.setHydrated();
        }
      },
    },
  ),
);
