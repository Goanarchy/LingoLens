export type LangCode = 'es' | 'en' | 'fr' | 'de' | 'it';

export type LanguageMeta = {
  code: LangCode;
  name: string;
  native: string;
  flag: string;
  speech: string;
  tint: string;
};

export const LANGUAGES: LanguageMeta[] = [
  { code: 'es', name: 'Español', native: 'Español', flag: '🇪🇸', speech: 'es-ES', tint: '#FFC46B' },
  { code: 'en', name: 'Inglés', native: 'English', flag: '🇬🇧', speech: 'en-US', tint: '#8CFFB8' },
  { code: 'fr', name: 'Francés', native: 'Français', flag: '🇫🇷', speech: 'fr-FR', tint: '#8AB4FF' },
  { code: 'de', name: 'Alemán', native: 'Deutsch', flag: '🇩🇪', speech: 'de-DE', tint: '#FF8AD1' },
  { code: 'it', name: 'Italiano', native: 'Italiano', flag: '🇮🇹', speech: 'it-IT', tint: '#9B8CFF' },
];

export const DEFAULT_LANGS: LangCode[] = ['es', 'en', 'fr', 'de', 'it'];

export const LANG_BY_CODE = LANGUAGES.reduce<Record<LangCode, LanguageMeta>>((acc, lang) => {
  acc[lang.code] = lang;
  return acc;
}, {} as Record<LangCode, LanguageMeta>);

export function isLangCode(value: string): value is LangCode {
  return Object.prototype.hasOwnProperty.call(LANG_BY_CODE, value);
}
