import type { LangCode } from './languages';

export type Rank = {
  name: string;
  xp: number;
  emoji: string;
  color: string;
  blurb: string;
};

export const RANKS: Rank[] = [
  { name: 'Curioso', xp: 0, emoji: '🌱', color: '#95A3B8', blurb: 'Todo gran viaje empieza con una palabra.' },
  { name: 'Explorador', xp: 120, emoji: '🧭', color: '#8CFFB8', blurb: 'Ya reconoces el mundo en otro idioma.' },
  { name: 'Viajero', xp: 350, emoji: '✈️', color: '#6EE7F9', blurb: 'Tu mochila empieza a pesar de vocabulario.' },
  { name: 'Lingüista', xp: 700, emoji: '📚', color: '#9B8CFF', blurb: 'Las palabras se conectan solas.' },
  { name: 'Políglota', xp: 1200, emoji: '🌍', color: '#FF8AD1', blurb: 'Piensas en varios idiomas a la vez.' },
  { name: 'Embajador', xp: 2000, emoji: '🏛️', color: '#FFC46B', blurb: 'Representas culturas, no solo idiomas.' },
  { name: 'Leyenda', xp: 3200, emoji: '👑', color: '#FFD700', blurb: 'Tu nombre ya es parte de la comunidad.' },
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
  { name: 'Aprendiz', min: 0, emoji: '🐣' },
  { name: 'Charlatán', min: 5, emoji: '💬' },
  { name: 'Conversador', min: 15, emoji: '🗣️' },
  { name: 'Fluido', min: 30, emoji: '🌊' },
  { name: 'Maestro', min: 60, emoji: '🎓' },
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

export const BADGES: BadgeDef[] = [
  { id: 'first_word', name: 'Primera palabra', description: 'Guarda tu primer descubrimiento.', emoji: '🌟', tier: 'bronze' },
  { id: 'five_words', name: 'Coleccionista', description: 'Guarda 5 objetos distintos.', emoji: '🎒', tier: 'bronze' },
  { id: 'twentyfive_words', name: 'Cazador de palabras', description: 'Guarda 25 objetos distintos.', emoji: '🏹', tier: 'silver' },
  { id: 'hundred_words', name: 'Enciclopedia', description: 'Guarda 100 objetos distintos.', emoji: '📖', tier: 'gold' },
  { id: 'five_langs', name: 'Cinco idiomas', description: 'Aprende al menos una palabra en cada idioma.', emoji: '🗺️', tier: 'silver' },
  { id: 'audio_20', name: 'Oído fino', description: 'Escucha 20 pronunciaciones.', emoji: '🎧', tier: 'bronze' },
  { id: 'first_post', name: 'Voz de la comunidad', description: 'Publica tu primer descubrimiento.', emoji: '📣', tier: 'bronze' },
  { id: 'ten_posts', name: 'Narrador', description: 'Publica 10 descubrimientos.', emoji: '🎙️', tier: 'silver' },
  { id: 'streak_3', name: 'Racha de 3 días', description: 'Aprende algo durante 3 días seguidos.', emoji: '🔥', tier: 'silver' },
  { id: 'streak_7', name: 'Semana imparable', description: 'Aprende algo durante 7 días seguidos.', emoji: '⚡', tier: 'gold' },
  { id: 'polyglot_rank', name: 'Políglota', description: 'Alcanza el rango Políglota.', emoji: '🌍', tier: 'gold' },
  { id: 'legend', name: 'Leyenda viva', description: 'Alcanza el rango Leyenda.', emoji: '👑', tier: 'legend' },
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
  xp: number;
};

const CHECKS: Record<string, (ctx: BadgeContext) => boolean> = {
  first_word: (ctx) => ctx.words >= 1,
  five_words: (ctx) => ctx.words >= 5,
  twentyfive_words: (ctx) => ctx.words >= 25,
  hundred_words: (ctx) => ctx.words >= 100,
  five_langs: (ctx) => ctx.langs >= 5,
  audio_20: (ctx) => ctx.audioPlays >= 20,
  first_post: (ctx) => ctx.posts >= 1,
  ten_posts: (ctx) => ctx.posts >= 10,
  streak_3: (ctx) => ctx.streak >= 3,
  streak_7: (ctx) => ctx.streak >= 7,
  polyglot_rank: (ctx) => ctx.xp >= 1200,
  legend: (ctx) => ctx.xp >= 3200,
};

export function evaluateBadges(ctx: BadgeContext, unlocked: Record<string, string>): string[] {
  return BADGES.filter((badge) => !unlocked[badge.id] && CHECKS[badge.id]?.(ctx)).map((badge) => badge.id);
}

export function countLanguages(words: Record<string, string>[]): number {
  const set = new Set<string>();
  words.forEach((entry) => Object.keys(entry).forEach((code) => set.add(code)));
  return set.size;
}

export function countByLanguage(words: Record<string, string>[]): Record<LangCode, number> {
  const counts = { es: 0, en: 0, fr: 0, de: 0, it: 0 } as Record<LangCode, number>;
  words.forEach((entry) => {
    (Object.keys(counts) as LangCode[]).forEach((code) => {
      if (entry[code]) counts[code] += 1;
    });
  });
  return counts;
}
