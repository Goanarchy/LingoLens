import { ALL_LANGS, type LangCode } from './languages';

export type Rank = {
  name: string;
  xp: number;
  emoji: string;
  color: string;
  blurb: string;
};

export const RANKS: Rank[] = [
  {
    name: 'Curious',
    xp: 0,
    emoji: '🌱',
    color: '#95A3B8',
    blurb: 'Every great polyglot journey begins with a single photo.',
  },
  {
    name: 'Explorer',
    xp: 120,
    emoji: '🧭',
    color: '#8CFFB8',
    blurb: 'You already spot everyday objects in five languages.',
  },
  {
    name: 'Traveler',
    xp: 350,
    emoji: '✈️',
    color: '#6EE7F9',
    blurb: 'Your camera roll is turning into a living dictionary.',
  },
  {
    name: 'Linguist',
    xp: 700,
    emoji: '📚',
    color: '#9B8CFF',
    blurb: 'Scripts, tones, and phonetics connect effortlessly.',
  },
  {
    name: 'Polyglot',
    xp: 1200,
    emoji: '🌍',
    color: '#FF8AD1',
    blurb: 'You think across Latin, Kanji, Devanagari, and Hanzi.',
  },
  {
    name: 'Ambassador',
    xp: 2000,
    emoji: '🏛️',
    color: '#FFC46B',
    blurb: 'You bridge cultures with every lens capture and spoken word.',
  },
  {
    name: 'Legend',
    xp: 3200,
    emoji: '👑',
    color: '#FFD700',
    blurb: 'Your streak and crowns are hall-of-fame material.',
  },
];

export type RankInfo = {
  rank: Rank;
  index: number;
  level: number;
  next: Rank | null;
  progress: number;
  xpToNext: number;
};

export function rankForXp(xp: number): RankInfo {
  let index = 0;
  for (let i = 0; i < RANKS.length; i += 1) {
    if (xp >= RANKS[i].xp) index = i;
  }
  const rank = RANKS[index];
  const next = RANKS[index + 1] ?? null;
  const progress = next ? Math.min(1, Math.max(0, (xp - rank.xp) / (next.xp - rank.xp))) : 1;
  return {
    rank,
    index,
    level: index + 1,
    next,
    progress,
    xpToNext: next ? Math.max(0, next.xp - xp) : 0,
  };
}

export type LangRank = {
  name: string;
  min: number;
  emoji: string;
};

export const LANG_RANKS: LangRank[] = [
  { name: 'Beginner', min: 0, emoji: '🐣' },
  { name: 'Chatterbox', min: 5, emoji: '💬' },
  { name: 'Conversationalist', min: 15, emoji: '🗣️' },
  { name: 'Fluent', min: 30, emoji: '🌊' },
  { name: 'Master', min: 60, emoji: '🎓' },
];

export function langRankInfo(count: number) {
  let index = 0;
  for (let i = 0; i < LANG_RANKS.length; i += 1) {
    if (count >= LANG_RANKS[i].min) index = i;
  }
  const rank = LANG_RANKS[index];
  const next = LANG_RANKS[index + 1] ?? null;
  const progress = next ? Math.min(1, Math.max(0, (count - rank.min) / (next.min - rank.min))) : 1;
  return { rank, index, next, progress, remaining: next ? Math.max(0, next.min - count) : 0 };
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'legend';

export type BadgeDef = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: BadgeTier;
};

/**
 * Weekly Photo Streak Milestones (1 Week, 2 Weeks, 3 Weeks) & Special Trophies.
 */
export type StreakMilestone = {
  id: string;
  weeks: 1 | 2 | 3;
  daysRequired: number;
  name: string;
  titleUnlocked: string;
  emoji: string;
  tier: BadgeTier;
  xpBonus: number;
  description: string;
};

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    id: 'streak_week_1',
    weeks: 1,
    daysRequired: 7,
    name: 'Week 1 · Bronze Lens Crown',
    titleUnlocked: 'Shutter Sprinter',
    emoji: '🥉',
    tier: 'bronze',
    xpBonus: 100,
    description: '7 consecutive days of daily photo discovery.',
  },
  {
    id: 'streak_week_2',
    weeks: 2,
    daysRequired: 14,
    name: 'Week 2 · Silver Prism Trophy',
    titleUnlocked: 'Fortnight Focus Master',
    emoji: '🥈',
    tier: 'silver',
    xpBonus: 250,
    description: '14 consecutive days of daily photo discovery.',
  },
  {
    id: 'streak_week_3',
    weeks: 3,
    daysRequired: 21,
    name: 'Week 3 · Golden Aperture Crown',
    titleUnlocked: 'Three-Week Dynasty',
    emoji: '👑',
    tier: 'legend',
    xpBonus: 500,
    description: '21 consecutive days of unstoppable photo & language mastery.',
  },
];

export const BADGES: BadgeDef[] = [
  {
    id: 'first_word',
    name: 'First Capture',
    description: 'Save your very first photographed object.',
    emoji: '🌟',
    tier: 'bronze',
  },
  {
    id: 'five_words',
    name: 'Collector',
    description: 'Save 5 distinct objects in your visual library.',
    emoji: '🎒',
    tier: 'bronze',
  },
  {
    id: 'twentyfive_words',
    name: 'Word Hunter',
    description: 'Save 25 distinct objects with your camera.',
    emoji: '🏹',
    tier: 'silver',
  },
  {
    id: 'five_langs',
    name: 'Five-Script Explorer',
    description: 'Learn at least one word in Spanish, English, Japanese, Hindi & Mandarin.',
    emoji: '🗺️',
    tier: 'silver',
  },
  {
    id: 'daily_crown_1',
    name: 'Daily Crown Catcher',
    description: 'Photograph the Word of the Day and claim your first Photo Crown.',
    emoji: '👑',
    tier: 'gold',
  },
  {
    id: 'daily_crown_5',
    name: 'Royal Photographer',
    description: 'Earn 5 Word of the Day Photo Crowns.',
    emoji: '🏆',
    tier: 'legend',
  },
  {
    id: 'pronunciation_1',
    name: 'Clear Voice',
    description: 'Pass your first Duolingo-style pronunciation test.',
    emoji: '🎙️',
    tier: 'bronze',
  },
  {
    id: 'pronunciation_10',
    name: 'Voice Virtuoso',
    description: 'Pass 10 pronunciation challenges across your languages.',
    emoji: '🎶',
    tier: 'gold',
  },
  {
    id: 'audio_20',
    name: 'Sharp Ear',
    description: 'Listen to 20 native audio pronunciations.',
    emoji: '🎧',
    tier: 'bronze',
  },
  {
    id: 'first_post',
    name: 'Community Debut',
    description: 'Share your first discovery on the Merit Feed.',
    emoji: '📣',
    tier: 'bronze',
  },
  {
    id: 'streak_3',
    name: '3-Day Spark',
    description: 'Maintain a 3-day learning or photo streak.',
    emoji: '🔥',
    tier: 'bronze',
  },
  {
    id: 'streak_7',
    name: 'Week 1 Champion',
    description: 'Complete a full 1-week (7-day) consecutive photo streak.',
    emoji: '⚡',
    tier: 'silver',
  },
  {
    id: 'streak_14',
    name: 'Week 2 Vanguard',
    description: 'Complete a full 2-week (14-day) consecutive photo streak.',
    emoji: '💎',
    tier: 'gold',
  },
  {
    id: 'streak_21',
    name: 'Week 3 Dynasty',
    description: 'Complete a full 3-week (21-day) consecutive photo streak.',
    emoji: '👑',
    tier: 'legend',
  },
  {
    id: 'polyglot_rank',
    name: 'True Polyglot',
    description: 'Reach the Polyglot rank (1,200+ XP).',
    emoji: '🌍',
    tier: 'gold',
  },
  {
    id: 'legend',
    name: 'Living Legend',
    description: 'Reach the Legend rank (3,200+ XP).',
    emoji: '🏛️',
    tier: 'legend',
  },
];

export const BADGE_BY_ID = BADGES.reduce<Record<string, BadgeDef>>((acc, badge) => {
  acc[badge.id] = badge;
  return acc;
}, {});

export type BadgeContext = {
  words: number;
  langs: number;
  audioPlays: number;
  posts: number;
  streak: number;
  photoStreak: number;
  crowns: number;
  pronunciationPasses: number;
  xp: number;
};

const CHECKS: Record<string, (ctx: BadgeContext) => boolean> = {
  first_word: (ctx) => ctx.words >= 1,
  five_words: (ctx) => ctx.words >= 5,
  twentyfive_words: (ctx) => ctx.words >= 25,
  five_langs: (ctx) => ctx.langs >= 5,
  daily_crown_1: (ctx) => ctx.crowns >= 1,
  daily_crown_5: (ctx) => ctx.crowns >= 5,
  pronunciation_1: (ctx) => ctx.pronunciationPasses >= 1,
  pronunciation_10: (ctx) => ctx.pronunciationPasses >= 10,
  audio_20: (ctx) => ctx.audioPlays >= 20,
  first_post: (ctx) => ctx.posts >= 1,
  streak_3: (ctx) => Math.max(ctx.streak, ctx.photoStreak) >= 3,
  streak_7: (ctx) => Math.max(ctx.streak, ctx.photoStreak) >= 7,
  streak_14: (ctx) => Math.max(ctx.streak, ctx.photoStreak) >= 14,
  streak_21: (ctx) => Math.max(ctx.streak, ctx.photoStreak) >= 21,
  polyglot_rank: (ctx) => ctx.xp >= 1200,
  legend: (ctx) => ctx.xp >= 3200,
};

export function evaluateBadges(ctx: BadgeContext, unlocked: Record<string, string>): string[] {
  return BADGES.filter((badge) => !unlocked[badge.id] && CHECKS[badge.id]?.(ctx)).map(
    (badge) => badge.id,
  );
}

export function countLanguages(words: Partial<Record<LangCode, string>>[]): number {
  const set = new Set<string>();
  words.forEach((entry) => {
    Object.keys(entry).forEach((code) => {
      if (entry[code as LangCode]) set.add(code);
    });
  });
  return set.size;
}

export function countByLanguage(
  words: Partial<Record<LangCode, string>>[],
): Record<LangCode, number> {
  const counts = ALL_LANGS.reduce<Record<LangCode, number>>(
    (acc, code) => {
      acc[code] = 0;
      return acc;
    },
    {} as Record<LangCode, number>,
  );

  words.forEach((entry) => {
    ALL_LANGS.forEach((code) => {
      if (entry[code]) counts[code] += 1;
    });
  });
  return counts;
}
