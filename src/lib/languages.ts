/**
 * Supported study languages.
 *
 * LingoLens 2.0 focuses on five languages that cover three very different
 * writing systems (Latin, CJK and Devanagari). Every translation therefore
 * carries the native script, a Latin romanization and an easy phonetic guide.
 */
export type LangCode = 'es' | 'en' | 'ja' | 'hi' | 'zh';

export type ScriptKind = 'latin' | 'japanese' | 'devanagari' | 'han';

export type LanguageMeta = {
  code: LangCode;
  /** English name shown in the UI. */
  name: string;
  /** Name written in the language itself. */
  native: string;
  flag: string;
  /** BCP-47 locale used for text-to-speech and speech recognition. */
  speech: string;
  /** Name of the romanization system shown under non-Latin words. */
  romanizationName: string | null;
  script: ScriptKind;
  tint: string;
};

export const LANGUAGES: LanguageMeta[] = [
  {
    code: 'es',
    name: 'Spanish',
    native: 'Español',
    flag: '🇪🇸',
    speech: 'es-ES',
    romanizationName: null,
    script: 'latin',
    tint: '#FFC46B',
  },
  {
    code: 'en',
    name: 'English',
    native: 'English',
    flag: '🇺🇸',
    speech: 'en-US',
    romanizationName: null,
    script: 'latin',
    tint: '#8CFFB8',
  },
  {
    code: 'ja',
    name: 'Japanese',
    native: '日本語',
    flag: '🇯🇵',
    speech: 'ja-JP',
    romanizationName: 'Rōmaji',
    script: 'japanese',
    tint: '#FF8AD1',
  },
  {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    flag: '🇮🇳',
    speech: 'hi-IN',
    romanizationName: 'Transliteration',
    script: 'devanagari',
    tint: '#FF9F5A',
  },
  {
    code: 'zh',
    name: 'Mandarin',
    native: '中文',
    flag: '🇨🇳',
    speech: 'zh-CN',
    romanizationName: 'Pinyin',
    script: 'han',
    tint: '#FF6B6B',
  },
];

export const ALL_LANGS: LangCode[] = LANGUAGES.map((language) => language.code);

/** Default selection for new users: all five languages. */
export const DEFAULT_LANGS: LangCode[] = [...ALL_LANGS];

export const LANG_BY_CODE = LANGUAGES.reduce<Record<LangCode, LanguageMeta>>(
  (acc, lang) => {
    acc[lang.code] = lang;
    return acc;
  },
  {} as Record<LangCode, LanguageMeta>,
);

export function isLangCode(value: unknown): value is LangCode {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(LANG_BY_CODE, value);
}

/** Keeps the canonical order and drops unknown or duplicated codes. */
export function sanitizeLangs(values: readonly unknown[] | null | undefined): LangCode[] {
  const wanted = new Set((values ?? []).filter(isLangCode));
  const ordered = ALL_LANGS.filter((code) => wanted.has(code));
  return ordered.length > 0 ? ordered : [...DEFAULT_LANGS];
}

/** True when the language is not written in the Latin alphabet. */
export function usesNonLatinScript(code: LangCode): boolean {
  return LANG_BY_CODE[code].script !== 'latin';
}
