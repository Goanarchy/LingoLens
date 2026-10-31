import type { LangCode } from './languages';

export type Category =
  | 'Food'
  | 'Drink'
  | 'Animal'
  | 'Furniture'
  | 'Clothing'
  | 'Tech'
  | 'Transport'
  | 'Nature'
  | 'Object';

export const CATEGORIES: Category[] = [
  'Food',
  'Drink',
  'Animal',
  'Furniture',
  'Clothing',
  'Tech',
  'Transport',
  'Nature',
  'Object',
];

/** One word in one language. */
export type Translation = {
  code: LangCode;
  /** The word written in its native script (りんご, 苹果, सेब, apple, manzana). */
  word: string;
  /** Latin romanization (ringo, píngguǒ, seb). Equal to `word` for Latin languages. */
  romanization: string;
  /** Easy respelling for English readers, stressed syllable in CAPS (e.g. "man-SAH-nah"). */
  phonetic: string;
  /** Article or measure word when the language has one (la, an, 个). */
  article?: string;
  /** Short natural sentence using the word, in the target language. */
  example?: string;
  /** English meaning of the example sentence. */
  exampleMeaning?: string;
};

/** Result of comparing a photo with today's word. */
export type DailyMatch = {
  /** True when the photo shows (or is clearly related to) today's word. */
  matched: boolean;
  /** Short explanation shown to the user. */
  reason: string;
  /** 'ai' when the vision model judged the match, 'catalog' when matched by name. */
  judgedBy: 'ai' | 'catalog' | 'none';
};

export type ScanResult = {
  /** Canonical English name of the main object (lowercase, singular). */
  object: string;
  emoji: string;
  category: Category;
  confidence: number;
  translations: Translation[];
  source: 'ai' | 'demo';
  /** Witty, photo-specific line from Kamu. */
  kamuQuip?: string;
  dailyMatch: DailyMatch;
  /** Shown when the AI was unavailable and the offline catalog was used. */
  notice?: string;
};

export type PendingScan = {
  uri: string;
  base64: string;
  mimeType?: string;
  /** ISO timestamp of the capture. */
  capturedAt: string;
};

export type LearnedWord = {
  id: string;
  object: string;
  emoji: string;
  category: Category;
  /** Native-script word per language code. */
  words: Partial<Record<LangCode, string>>;
  /** Romanization per language code (only for non-Latin scripts). */
  romanizations?: Partial<Record<LangCode, string>>;
  createdAt: string;
  favorite?: boolean;
  /** Local URI of the downscaled photo, when available. */
  photoUri?: string;
};

export type ReviewGrade = 'again' | 'good' | 'easy';

/** Minimal spaced-repetition state for a saved word. */
export type ReviewState = {
  /** Days until the next review. */
  interval: number;
  /** Ease factor (2.5 at the start). */
  ease: number;
  /** ISO date of the next review. */
  due: string;
  reps: number;
  lapses: number;
};

export type CrownTier = 'bronze' | 'silver' | 'gold';

/** One crown earned by photographing the word of the day. */
export type CrownRecord = {
  /** Local day key (YYYY-MM-DD). */
  day: string;
  tier: CrownTier;
  object: string;
  dailyWord: string;
  earnedAt: string;
};

export type Post = {
  id: string;
  author: string;
  initials: string;
  avatarColor: string;
  object: string;
  emoji: string;
  category: Category;
  words: Translation[];
  likes: number;
  likedByMe: boolean;
  mine: boolean;
  caption?: string;
  createdAt: string;
  /** Merit shown on the post: author's photo streak, crowns and rank at posting time. */
  authorStreak: number;
  authorCrowns: number;
  authorRank: string;
  /** True when the post was a word-of-the-day catch. */
  dailyCatch: boolean;
  /** Reaction counts (🔥 💡 👑). */
  reactions: Record<ReactionKind, number>;
  myReactions: ReactionKind[];
};

export type ReactionKind = 'fire' | 'idea' | 'crown';

export type Stats = {
  audioPlays: number;
  likesGiven: number;
  postsCreated: number;
  /** Learning streak: days in a row with any learning activity. */
  streak: number;
  lastActiveDay: string | null;
  /** Photo streak: days in a row with at least one analyzed photo. */
  photoStreak: number;
  bestPhotoStreak: number;
  lastPhotoDay: string | null;
  photosTaken: number;
  pronunciationPasses: number;
  pronunciationAttempts: number;
};

export type RewardEvent =
  | { kind: 'xp'; amount: number; label: string }
  | { kind: 'crown'; tier: CrownTier }
  | { kind: 'trophy'; trophyId: string }
  | { kind: 'badge'; badgeId: string }
  | { kind: 'streak'; days: number };

export type RegisterOutcome = {
  xpGained: number;
  newBadges: string[];
  duplicate: boolean;
};

export type PhotoOutcome = {
  xpGained: number;
  events: RewardEvent[];
  photoStreak: number;
  crown: CrownTier | null;
  newTrophies: string[];
  newBadges: string[];
};

export type PronunciationOutcome = {
  xpGained: number;
  firstPass: boolean;
  newBadges: string[];
};

export type PostOutcome = {
  xpGained: number;
  newBadges: string[];
};
