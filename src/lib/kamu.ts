import type { LangCode } from './languages';

/** Color de Kamu por idioma: cambia de piel según el idioma que esté mirando. */
export const KAMU_LANG_COLORS: Record<LangCode, string> = {
  es: '#8CFFB8',
  en: '#7FD0FF',
  fr: '#9B8CFF',
  de: '#FFC46B',
  it: '#FF8AD1',
};

/**
 * Frases de Kamu. Son deliberadamente cortas y con humor seco.
 * El tono es de superioridad cariñosa: se burla un poco, nunca humilla.
 */
export const KAMU_SCAN_LINES = [
  '¿Pero qué demonios es esto?',
  'Mmm… esto huele a objeto raro.',
  'A ver, a ver… ¿qué me trajiste?',
  'No me juzgues, tú tampoco sabes qué es.',
  'Tranquilo, yo me encargo.',
] as const;

export const KAMU_FOUND_LINES = [
  'Ah, ya sé qué es. Obvio.',
  'Fácil. Siguiente.',
  'Esto lo sabía desde que nací.',
  'Listo. De nada.',
  '¿En serio no lo sabías?',
] as const;

export const KAMU_SAVED_LINES = [
  'Guardado. Ya eres un poco menos ignorante.',
  'Otra palabra para la colección.',
  'Bien. Sigue así y te vuelves peligroso.',
] as const;

export const KAMU_DUPLICATE_LINES = [
  'Esa ya la tenías, genio.',
  'Repetir también cuenta… supongo.',
  'Otra vez. Qué entusiasmo.',
] as const;

export const KAMU_REVIEW_LINES = [
  'A ver si de verdad te acuerdas.',
  'Sin mirar. Confío en ti. Poco.',
  'Repasar es de inteligentes.',
] as const;

export const KAMU_EMPTY_LINES = [
  'Aquí no hay nada. Escanea algo.',
  'Vacío. Como tu memoria sin repasar.',
  'Ni una palabra. Vamos a trabajar.',
] as const;

export const KAMU_STREAK_LINES = [
  'Racha viva. No la arruines hoy.',
  'Volviste. Me sorprendes.',
  'Constancia. Casi me caes bien.',
] as const;

/** Elige una frase de forma determinista para evitar saltos entre renders. */
export function pickLine(lines: readonly string[], seed: number): string {
  if (lines.length === 0) return '';
  const index = Math.abs(Math.trunc(seed)) % lines.length;
  return lines[index];
}
