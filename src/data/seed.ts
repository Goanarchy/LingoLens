import { CATALOG } from '@/lib/demoCatalog';
import { DEFAULT_LANGS } from '@/lib/languages';
import type { Post } from '@/lib/types';

type SeedPost = {
  object: string;
  author: string;
  initials: string;
  color: string;
  likes: number;
  minutesAgo: number;
  caption: string;
};

const SEEDS: SeedPost[] = [
  {
    object: 'manzana',
    author: 'Lucía',
    initials: 'LU',
    color: '#FFC46B',
    likes: 42,
    minutesAgo: 8,
    caption: 'Mi primer descubrimiento del día 🍎',
  },
  {
    object: 'perro',
    author: 'Mateo',
    initials: 'MA',
    color: '#8CFFB8',
    likes: 31,
    minutesAgo: 26,
    caption: 'Encontré a este señor en el parque 🐶',
  },
  {
    object: 'flor',
    author: 'Sofía',
    initials: 'SO',
    color: '#FF8AD1',
    likes: 27,
    minutesAgo: 55,
    caption: 'Primavera en cinco idiomas 🌸',
  },
  {
    object: 'café',
    author: 'Diego',
    initials: 'DI',
    color: '#9B8CFF',
    likes: 19,
    minutesAgo: 92,
    caption: 'El café sabe mejor cuando lo pides bien ☕',
  },
  {
    object: 'ventana',
    author: 'Aitana',
    initials: 'AI',
    color: '#6EE7F9',
    likes: 12,
    minutesAgo: 140,
    caption: 'Aprendiendo desde casa 🪟',
  },
  {
    object: 'libro',
    author: 'Nicolás',
    initials: 'NI',
    color: '#8AB4FF',
    likes: 9,
    minutesAgo: 220,
    caption: 'Un libro, cinco formas de llamarlo 📚',
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
    };
  });
}
