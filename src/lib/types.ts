import type { LangCode } from './languages';

export type Translation = {
  code: LangCode;
  word: string;
  phonetic: string;
  article?: string;
  example?: string;
};

export type ScanResult = {
  object: string;
  emoji: string;
  category: string;
  confidence: number;
  translations: Translation[];
  source: 'ai' | 'demo';
  /** Aviso para el usuario cuando la IA no respondió y se usó el catálogo local. */
  notice?: string;
};

export type PendingScan = {
  uri: string;
  base64: string;
  mimeType?: string;
};

export type LearnedWord = {
  id: string;
  object: string;
  emoji: string;
  category: string;
  words: Record<string, string>;
  createdAt: string;
  favorite?: boolean;
};

export type ReviewGrade = 'again' | 'good' | 'easy';

/** Estado mínimo de repetición espaciada para una palabra guardada. */
export type ReviewState = {
  /** Días hasta el próximo repaso. */
  interval: number;
  /** Factor de facilidad (2.5 al empezar). */
  ease: number;
  /** Fecha ISO del próximo repaso. */
  due: string;
  reps: number;
  lapses: number;
};

export type Post = {
  id: string;
  author: string;
  initials: string;
  avatarColor: string;
  object: string;
  emoji: string;
  category: string;
  words: Translation[];
  likes: number;
  likedByMe: boolean;
  mine: boolean;
  caption?: string;
  createdAt: string;
};

export type Stats = {
  audioPlays: number;
  likesGiven: number;
  postsCreated: number;
  streak: number;
  lastActiveDay: string | null;
};

export type RegisterOutcome = {
  xpGained: number;
  newBadges: string[];
  duplicate: boolean;
};

export type PostOutcome = {
  xpGained: number;
  newBadges: string[];
};
