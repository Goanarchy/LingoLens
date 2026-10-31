import { findCatalogEntry } from './demoCatalog';
import type { LangCode } from './languages';
import type { Category } from './types';

/**
 * Kamu's chromatic scale color per language.
 */
export const KAMU_LANG_COLORS: Record<LangCode, string> = {
  es: '#FFC46B',
  en: '#8CFFB8',
  ja: '#FF8AD1',
  hi: '#FF9F5A',
  zh: '#FF6B6B',
};

/**
 * Official backstory & personality dossier for Kamu.
 */
export const KAMU_LORE = {
  name: 'Kamu',
  species: 'One-Eyed Prism Chameleon',
  origin: 'Kyoto Optical Lab · Periscope Lens Chamber #09',
  motto: 'I see the world; you keep the words.',
  bio: 'Born inside the sapphire prism of a prototype telephoto camera, Kamu absorbed light from street markets in Madrid, London, Tokyo, Mumbai, and Shanghai. His giant aperture eye locks onto any everyday object, while his chromatic scales shift hue with every language you speak.',
  traits: [
    'Affectionately sarcastic photo critic',
    'Obsessed with 7-day, 14-day & 21-day photo streaks',
    'Wears a golden crown whenever you catch the Word of the Day',
  ],
} as const;

/** Lines spoken while the vision AI is analyzing a photo. */
export const KAMU_THINKING_LINES = [
  'What on earth did you just point my lens at?',
  'Adjusting my aperture eye… hold your hand steady!',
  'Hmm, intriguing lighting. Let me consult five dictionaries.',
  'Don’t judge me—you didn’t know how to say it in Hindi either.',
  'My chameleon brain is translating at 120 frames per second…',
  'Is that today’s Word of the Day, or are you improvising?',
  'Zooming in with my single glorious eye…',
  'My tail is curling with suspense. Give me one second.',
  'Translating across Latin, Kanji, Devanagari, and Hanzi…',
  'Okay, framing is 8/10. Let’s see what vocabulary we caught.',
] as const;

export const KAMU_FOUND_LINES = [
  'Nailed it. My giant eye never misses.',
  'Easy catch. Now let’s hear you pronounce it.',
  'Identified in five languages. You’re welcome.',
  'Boom! Fresh vocabulary served hot.',
  'My crest is standing tall—that was a clean shot.',
] as const;

export const KAMU_SAVED_LINES = [
  'Saved! Your brain just gained a permanent wrinkle.',
  'Another trophy word locked into your collection.',
  'Keep this pace up and you’ll outsmart me by next Tuesday.',
  'Stored in five scripts. Your future self says thanks.',
  'Boom—added to your deck and your streak is glowing.',
] as const;

export const KAMU_DUPLICATE_LINES = [
  'You already caught this one, chief—still good practice though!',
  'Déjà vu! My eye remembers this object, even if you forgot.',
  'Already in your library, but I respect the enthusiasm.',
  'Double-checking an old friend? Try the pronunciation test below!',
] as const;

export const KAMU_REVIEW_LINES = [
  'No peeking. Let’s see if your memory is as sharp as your camera.',
  'Say it out loud before you flip the card—I’m listening.',
  'Spaced repetition is where casual tourists become polyglots.',
  'Come on, you photographed this yourself!',
  'Every flashcard brings you closer to the 3-Week Dynasty Crown.',
] as const;

export const KAMU_EMPTY_LINES = [
  'Nothing here yet. Point your camera at literally anything!',
  'Empty as a chameleon’s calendar. Go snap a photo!',
  'Give me one photo and I’ll give you five languages.',
  'Your library is hungry—feed it a coffee mug or a cat.',
] as const;

export const KAMU_STREAK_LINES = [
  'Your photo streak is alive! Don’t break the chain today.',
  'Consistency beats talent. Look at those weekly crowns!',
  '1 week, 2 weeks, 3 weeks—you’re building a dynasty.',
  'You came back! My tail just did a happy flip.',
] as const;

export const KAMU_PRONUNCIATION_PASS_LINES = [
  'Wait… that accent was actually impressive. +15 XP!',
  'Crispy syllables! Even native speakers would nod at that.',
  'My single eye just shed a tear of pride. Spot-on cadence!',
  'Validated! Your vocal cords just earned their keep.',
] as const;

export const KAMU_PRONUNCIATION_RETRY_LINES = [
  'Close! Tap the turtle 🐢 to hear it slowly, then try again.',
  'Your tongue tripped on the middle syllable—give it another shot!',
  'Almost had it! Watch the phonetic guide and hold the mic steady.',
] as const;

/** Contextual guide lines per screen for the interactive Kamu companion. */
export const KAMU_SCREEN_TIPS: Record<
  'scan' | 'result' | 'library' | 'feed' | 'profile' | 'review',
  readonly string[]
> = {
  scan: [
    'Snap today’s Word of the Day to unlock a Daily Photo Crown +25 XP!',
    'Tap any flag pill below the viewfinder to toggle which languages you study.',
    'Testing in Expo Go? Use the Quick Demo Target pill to simulate any object!',
  ],
  result: [
    'Tap the speaker for normal speed, or the turtle 🐢 for slow syllable audio.',
    'Pass the Duolingo-style pronunciation check on any card to earn +15 XP!',
    'Save the word and share it to the Merit Feed to climb the podium.',
  ],
  library: [
    'Search in English, Spanish, Japanese, Hindi, or Mandarin—I index all five.',
    'Tap any language pill on a saved card to hear its native pronunciation.',
    'When the purple Review banner lights up, your flashcards are ready!',
  ],
  feed: [
    'Welcome to the Merit Arena! Streaks of 1, 2, and 3 weeks rule the podium.',
    'React with 🔥, 💡, or 👑 to salute fellow photographers’ discoveries.',
    'Filter by 👑 Crown Catches to see who nailed the Word of the Day!',
  ],
  profile: [
    'Chain 7, 14, and 21 daily photos to unlock the Week 1, 2 & 3 Crowns!',
    'Toggle between 1 and 5 active languages anytime—results adapt live.',
    'Tap me anywhere in the app if you want a hint or a pep talk.',
  ],
  review: [
    'Try pronouncing the word in all active languages before revealing!',
    'Grading honestly keeps your spaced-repetition schedule razor-sharp.',
  ],
};

const CATEGORY_QUIPS: Record<Category, readonly string[]> = {
  Food: [
    'Photographing {object} before eating it? True food-blogger discipline.',
    'That {object} looks delicious—and now you can order it in five countries.',
    'Zero calories added, five new translations unlocked for {object}!',
  ],
  Drink: [
    'Cheers! Now you can order {object} from Madrid to Tokyo without pointing.',
    'Refreshing shot of that {object}—your lens didn’t even fog up.',
    'Sip that {object} and warm up your vocal cords for the pronunciation test.',
  ],
  Animal: [
    'A wild {object} appeared! And it posed almost as well as a chameleon.',
    'Tell that {object} I said hi in Spanish, Japanese, and Mandarin.',
    'National Geographic called—they want your {object} portrait.',
  ],
  Furniture: [
    'Interior design Magazine worthy! That {object} anchors the whole room.',
    'Solid {object}. 10/10 would perch on it and judge your pronunciation.',
    'Who knew a {object} could unlock vocabulary in three writing systems?',
  ],
  Clothing: [
    'Stylish {object}! Fashion weeks in Milan and Tokyo are taking notes.',
    'Sharp threads—now you know what to call that {object} worldwide.',
    'If they tailored a {object} for chameleons, I’d wear it on my tail.',
  ],
  Tech: [
    'Using high-tech optics to scan a {object}—peak cyberpunk energy.',
    'That {object} has silicon; I have chromatic scales. Together we’re unstoppable.',
    'Clean gadget shot! Now pronounce {object} in Mandarin without buffering.',
  ],
  Transport: [
    'Next stop: fluency! That {object} is ready to roll across five borders.',
    'Fast lens, fast {object}. Your vocabulary is officially in the express lane.',
    'Panoramic shot of that {object}—my telephoto eye approves.',
  ],
  Nature: [
    'Ah, {object}—my natural chameleon habitat! Look how my scales match.',
    'Fresh air and fresh vocabulary: that {object} is a 10/10 capture.',
    'Nature’s finest {object}, now cataloged in five languages.',
  ],
  Object: [
    'An everyday {object} turned into a five-language masterclass. Nice eye!',
    'You spotted a {object}! Proof that literally everything around you is a lesson.',
    'Crisp focus on that {object}—let’s hear you pronounce it below!',
  ],
};

/**
 * Generates a witty, specific comment from Kamu about the exact object photographed.
 */
export function getPhotoQuip(
  objectName: string,
  category: Category = 'Object',
  dailyMatched = false,
  seed = 0,
): string {
  const cleanName = (objectName || 'mystery object').trim().toLowerCase();
  const entry = findCatalogEntry(cleanName);
  const idx = Math.abs(Math.trunc(seed || cleanName.length * 13)) % 3;

  let base: string;
  if (entry && entry.quips.length > 0) {
    base = entry.quips[idx % entry.quips.length];
  } else {
    const pool = CATEGORY_QUIPS[category] ?? CATEGORY_QUIPS.Object;
    const template = pool[idx % pool.length];
    base = template.replace(/\{object\}/g, cleanName);
  }

  if (dailyMatched) {
    return `👑 WORD OF THE DAY CATCH! ${base}`;
  }
  return base;
}

/** Deterministic picker to avoid flicker across renders. */
export function pickLine(lines: readonly string[], seed: number): string {
  if (lines.length === 0) return '';
  const index = Math.abs(Math.trunc(seed)) % lines.length;
  return lines[index];
}
