import { CATALOG } from '@/lib/demoCatalog';
import { DEFAULT_LANGS } from '@/lib/languages';
import type { Post, ReactionKind } from '@/lib/types';

export type MeritRival = {
  id: string;
  name: string;
  initials: string;
  color: string;
  photoStreak: number;
  crowns: number;
  xp: number;
  rankName: string;
  rankEmoji: string;
  specialty: string;
};

/**
 * Hall-of-Fame peers displayed on the Merit Social Leaderboard alongside the user.
 */
export const MERIT_RIVALS: MeritRival[] = [
  {
    id: 'rival-hana',
    name: 'Hana Takahashi',
    initials: 'HT',
    color: '#FFD700',
    photoStreak: 23,
    crowns: 19,
    xp: 3480,
    rankName: 'Legend',
    rankEmoji: '👑',
    specialty: '3-Week Dynasty · Tokyo & Madrid street shots',
  },
  {
    id: 'rival-aarav',
    name: 'Aarav Sharma',
    initials: 'AS',
    color: '#FF9F5A',
    photoStreak: 16,
    crowns: 12,
    xp: 2190,
    rankName: 'Ambassador',
    rankEmoji: '🏛️',
    specialty: '2-Week Prism Winner · Hindi & Mandarin pro',
  },
  {
    id: 'rival-lucia',
    name: 'Lucía Mendoza',
    initials: 'LM',
    color: '#8CFFB8',
    photoStreak: 9,
    crowns: 7,
    xp: 1340,
    rankName: 'Polyglot',
    rankEmoji: '🌍',
    specialty: '1-Week Crown Holder · Daily café hunter',
  },
  {
    id: 'rival-mei',
    name: 'Mei Lin',
    initials: 'ML',
    color: '#FF8AD1',
    photoStreak: 5,
    crowns: 4,
    xp: 780,
    rankName: 'Linguist',
    rankEmoji: '📚',
    specialty: 'Five-script pronunciation ace',
  },
];

type SeedPost = {
  object: string;
  author: string;
  initials: string;
  color: string;
  likes: number;
  minutesAgo: number;
  caption: string;
  authorStreak: number;
  authorCrowns: number;
  authorRank: string;
  dailyCatch: boolean;
  reactions: Record<ReactionKind, number>;
};

const SEEDS: SeedPost[] = [
  {
    object: 'coffee',
    author: 'Hana Takahashi',
    initials: 'HT',
    color: '#FFD700',
    likes: 58,
    minutesAgo: 9,
    caption: 'Day 23 of my 3-Week Dynasty streak! Morning espresso nailed in all 5 scripts ☕👑',
    authorStreak: 23,
    authorCrowns: 19,
    authorRank: '👑 Legend',
    dailyCatch: true,
    reactions: { fire: 31, idea: 14, crown: 22 },
  },
  {
    object: 'apple',
    author: 'Aarav Sharma',
    initials: 'AS',
    color: '#FF9F5A',
    likes: 41,
    minutesAgo: 28,
    caption: 'Caught today’s Word of the Day at the market! Passed Hindi & Japanese pronunciation on attempt #1 🍎',
    authorStreak: 16,
    authorCrowns: 12,
    authorRank: '🏛️ Ambassador',
    dailyCatch: true,
    reactions: { fire: 19, idea: 11, crown: 15 },
  },
  {
    object: 'cat',
    author: 'Lucía Mendoza',
    initials: 'LM',
    color: '#8CFFB8',
    likes: 34,
    minutesAgo: 54,
    caption: 'Just unlocked my Week 1 Bronze Lens Crown with this sleepy street cat 🐱🔥',
    authorStreak: 9,
    authorCrowns: 7,
    authorRank: '🌍 Polyglot',
    dailyCatch: false,
    reactions: { fire: 24, idea: 8, crown: 9 },
  },
  {
    object: 'book',
    author: 'Mei Lin',
    initials: 'ML',
    color: '#FF8AD1',
    likes: 22,
    minutesAgo: 96,
    caption: 'Comparing Kanji 本 and Mandarin 书 side by side—love how visual scripts connect 📚',
    authorStreak: 5,
    authorCrowns: 4,
    authorRank: '📚 Linguist',
    dailyCatch: false,
    reactions: { fire: 12, idea: 16, crown: 5 },
  },
  {
    object: 'flower',
    author: 'Mateo Rivera',
    initials: 'MR',
    color: '#6EE7F9',
    likes: 18,
    minutesAgo: 150,
    caption: 'Afternoon walk capture: 花 (hana / huā) and फूल (phūl) in one shot 🌸',
    authorStreak: 4,
    authorCrowns: 2,
    authorRank: '✈️ Traveler',
    dailyCatch: false,
    reactions: { fire: 9, idea: 7, crown: 4 },
  },
];

export function seedPosts(): Post[] {
  const now = Date.now();
  return SEEDS.map((seed, index) => {
    const entry = CATALOG.find((item) => item.object === seed.object) ?? CATALOG[0];
    return {
      id: `seed-${index + 1}`,
      author: seed.author,
      initials: seed.initials,
      avatarColor: seed.color,
      object: entry.object,
      emoji: entry.emoji,
      category: entry.category,
      words: entry.translations.filter((item) => DEFAULT_LANGS.includes(item.code)),
      likes: seed.likes,
      likedByMe: false,
      mine: false,
      caption: seed.caption,
      createdAt: new Date(now - seed.minutesAgo * 60_000).toISOString(),
      authorStreak: seed.authorStreak,
      authorCrowns: seed.authorCrowns,
      authorRank: seed.authorRank,
      dailyCatch: seed.dailyCatch,
      reactions: { ...seed.reactions },
      myReactions: [],
    };
  });
}
