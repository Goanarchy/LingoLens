import {
  catalogTranslations,
  demoResult,
  evaluateDailyMatch,
  findCatalogEntry,
  getDailyWord,
} from './demoCatalog';
import { ALL_LANGS, LANGUAGES, isLangCode, type LangCode } from './languages';
import { getPhotoQuip } from './kamu';
import { CATEGORIES, type Category, type PendingScan, type ScanResult, type Translation } from './types';

/**
 * Keyless Vision & On-Device Hybrid AI Engine (Pixel 9 Pro XL + Expo Go ready).
 *
 * Uses OVHcloud AI Endpoints' anonymous tier (Qwen2.5-VL-72B-Instruct and
 * fallback vision models) with automatic model rotation. Each photo is downscaled
 * to 1024px JPEG beforehand to respect the Pixel 9 Pro XL 50 MP sensor memory budget.
 * If the free cloud endpoint is rate-limited or offline, the engine falls back
 * transparently to the local 5-language catalog so the user is never blocked.
 */
const ENDPOINT = 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions';

const VISION_MODELS = [
  'Qwen2.5-VL-72B-Instruct',
  'Qwen3.8-27B',
  'Qwen3.5-9B',
  'Qwen3.6-27B',
] as const;

const REQUEST_TIMEOUT_MS = 28_000;
const OVERALL_BUDGET_MS = 50_000;

export type IdentifyOptions = {
  langs?: LangCode[];
  signal?: AbortSignal;
  /** Forces the local catalog without calling the network. */
  demo?: boolean;
  /** Optional catalog object id/name to simulate during demo or testing. */
  preferredObject?: string;
};

export class VisionError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'VisionError';
    this.status = status;
  }
}

function abortError(): Error {
  const error = new Error('Aborted');
  error.name = 'AbortError';
  return error;
}

function buildPrompt(dailyWord: string): string {
  const langList = LANGUAGES.map(
    (lang) => `${lang.code} (${lang.name} — native script: ${lang.native})`,
  ).join(', ');

  return [
    'You are a visual lexicographer and witty language coach inside the LingoLens mobile app.',
    `Today's Word of the Day is "${dailyWord}".`,
    'Analyze the user photo and perform these tasks:',
    '1. Identify the single most prominent object. Return its lowercase singular English noun in "object", a matching "emoji", and a "category" from: Food, Drink, Animal, Furniture, Clothing, Tech, Transport, Nature, Object.',
    `2. Translate that object into ALL 5 languages: ${langList}. For each language return:`,
    '   - "code": one of "es", "en", "ja", "hi", "zh".',
    '   - "word": the noun in its NATIVE script (Spanish/English Latin, Japanese Kanji/Kana, Hindi Devanagari, Mandarin Simplified Chinese), singular, without article.',
    '   - "romanization": Latin transliteration (Hepburn romaji with macrons for Japanese, ISO-lite transliteration for Hindi, Hanyu Pinyin with tone marks for Mandarin; repeat the word for es/en).',
    '   - "phonetic": easy English-reader phonetic respelling with hyphenated syllables and stressed syllable in CAPS (e.g. "mahn-SAH-nah", "reen-goh", "SAYB", "ping-gwoh").',
    '   - "article": Spanish definite article (el/la), English (a/an), or Mandarin measure word (个, 只, 本, 把, 张, 杯, 辆, 台). Omit for ja/hi.',
    '   - "example": a short natural sentence in the target language (native script) using the word.',
    '   - "exampleMeaning": the English translation of that example sentence.',
    `3. Check if the photographed object is "${dailyWord}" or directly related to "${dailyWord}". Return "dailyMatched" (boolean) and "dailyReason" (one short English sentence).`,
    '4. Return "kamuQuip": one funny, affectionate, slightly sarcastic sentence (max 95 chars) spoken by Kamu, our one-eyed chameleon mascot, commenting specifically on THIS photo.',
    '5. Return "confidence" between 0 and 1.',
    'Respond ONLY with a valid JSON object, no markdown fences, matching this schema:',
    '{"object":"apple","emoji":"🍎","category":"Food","confidence":0.95,"dailyMatched":true,"dailyReason":"You captured an apple!","kamuQuip":"Crisp, round, and posing better than most influencers.","translations":[{"code":"es","word":"manzana","romanization":"manzana","phonetic":"mahn-SAH-nah","article":"la","example":"...","exampleMeaning":"..."},{"code":"en","word":"apple","romanization":"apple","phonetic":"AP-uhl","article":"an","example":"...","exampleMeaning":"..."},{"code":"ja","word":"りんご","romanization":"ringo","phonetic":"reen-goh","example":"...","exampleMeaning":"..."},{"code":"hi","word":"सेब","romanization":"seb","phonetic":"SAYB","example":"...","exampleMeaning":"..."},{"code":"zh","word":"苹果","romanization":"píngguǒ","phonetic":"ping-gwoh","article":"个","example":"...","exampleMeaning":"..."}]}',
  ].join('\n');
}

function extractJson(text: string): unknown {
  let cleaned = text
    .replace(/<think[\s\S]*?<\/think>/gi, '')
    .replace(/```(?:json)?/gi, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new VisionError('The vision AI returned an unreadable response.');
  }

  cleaned = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new VisionError('The vision AI returned incomplete JSON.');
  }
}

function coerceCategory(raw: unknown): Category {
  if (typeof raw === 'string') {
    const match = CATEGORIES.find((c) => c.toLowerCase() === raw.trim().toLowerCase());
    if (match) return match;
  }
  return 'Object';
}

function normalize(raw: unknown, langs: readonly LangCode[]): ScanResult {
  const data = raw as (Partial<ScanResult> & {
    dailyMatched?: boolean;
    dailyReason?: string;
    kamuQuip?: string;
  }) | null;

  if (!data || typeof data.object !== 'string' || !Array.isArray(data.translations)) {
    throw new VisionError('The vision AI returned an unexpected payload.');
  }

  const objectName = data.object.trim().toLowerCase();
  const catalogMatch = findCatalogEntry(objectName);
  const byCode = new Map<LangCode, Translation>();

  if (catalogMatch) {
    for (const item of catalogMatch.translations) {
      byCode.set(item.code, { ...item });
    }
  }

  for (const item of data.translations) {
    if (!item || typeof item.word !== 'string' || !isLangCode(String(item.code))) continue;
    const word = item.word.trim();
    if (!word) continue;
    const fallback = byCode.get(item.code);
    byCode.set(item.code, {
      code: item.code,
      word,
      romanization:
        typeof item.romanization === 'string' && item.romanization.trim()
          ? item.romanization.trim()
          : fallback?.romanization ?? word,
      phonetic:
        typeof item.phonetic === 'string' && item.phonetic.trim()
          ? item.phonetic.trim()
          : fallback?.phonetic ?? word,
      article:
        typeof item.article === 'string' && item.article.trim()
          ? item.article.trim()
          : fallback?.article,
      example:
        typeof item.example === 'string' && item.example.trim()
          ? item.example.trim()
          : fallback?.example,
      exampleMeaning:
        typeof item.exampleMeaning === 'string' && item.exampleMeaning.trim()
          ? item.exampleMeaning.trim()
          : fallback?.exampleMeaning,
    });
  }

  if (byCode.size === 0) {
    throw new VisionError('Translations arrived incomplete.');
  }

  const activeLangs = langs.length > 0 ? langs : ALL_LANGS;
  const translations = ALL_LANGS.map((code) => byCode.get(code)).filter(
    (item): item is Translation => Boolean(item),
  );

  const filteredTranslations = activeLangs
    .map((code) => byCode.get(code))
    .filter((item): item is Translation => Boolean(item));

  const confidenceRaw =
    typeof data.confidence === 'number'
      ? data.confidence
      : Number.parseFloat(String(data.confidence ?? '0.88'));
  const confidence = Number.isFinite(confidenceRaw)
    ? Math.min(1, Math.max(0, confidenceRaw))
    : 0.88;

  const category = catalogMatch?.category ?? coerceCategory(data.category);
  const emoji =
    typeof data.emoji === 'string' && data.emoji.trim().length > 0
      ? data.emoji.trim().slice(0, 8)
      : catalogMatch?.emoji ?? '✨';

  const daily = getDailyWord();
  const dailyMatch = evaluateDailyMatch(
    objectName,
    daily,
    Boolean(data.dailyMatched),
    typeof data.dailyReason === 'string' ? data.dailyReason : undefined,
  );

  const kamuQuip =
    typeof data.kamuQuip === 'string' && data.kamuQuip.trim().length > 8
      ? data.kamuQuip.trim()
      : getPhotoQuip(objectName, category, dailyMatch.matched);

  return {
    object: objectName,
    emoji,
    category,
    confidence,
    translations: filteredTranslations.length > 0 ? filteredTranslations : translations,
    source: 'ai',
    kamuQuip,
    dailyMatch,
  };
}

function statusMessage(status: number): string {
  if (status === 429) return 'The free vision AI is currently busy (rate limit).';
  if (status === 401 || status === 403) return 'The free vision endpoint rejected the request.';
  if (status === 404) return 'The vision model is temporarily unavailable.';
  if (status >= 500) return 'The free vision server did not respond.';
  return `The vision service returned status ${status}.`;
}

async function requestModel(
  model: string,
  scan: PendingScan,
  prompt: string,
  external?: AbortSignal,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const forwardAbort = () => controller.abort();
  external?.addEventListener('abort', forwardAbort);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${scan.mimeType ?? 'image/jpeg'};base64,${scan.base64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 2200,
        temperature: 0.25,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new VisionError(statusMessage(response.status), response.status);
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = json.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new VisionError('The vision AI returned an empty answer.');
    }
    return content;
  } catch (error) {
    if (external?.aborted) throw abortError();
    if ((error as Error).name === 'AbortError') {
      throw new VisionError('The vision AI timed out.');
    }
    if (error instanceof VisionError) throw error;
    throw new VisionError('Could not reach the free vision AI endpoint.');
  } finally {
    clearTimeout(timer);
    external?.removeEventListener('abort', forwardAbort);
  }
}

export async function identifyObject(
  scan: PendingScan,
  opts: IdentifyOptions = {},
): Promise<ScanResult> {
  const langs = opts.langs?.length ? opts.langs : ALL_LANGS;

  if (opts.demo || opts.preferredObject) {
    return demoResult(langs, opts.preferredObject);
  }

  const daily = getDailyWord();
  const prompt = buildPrompt(daily.object);
  const deadline = Date.now() + OVERALL_BUDGET_MS;
  let lastError: VisionError | null = null;

  for (const model of VISION_MODELS) {
    if (opts.signal?.aborted) throw abortError();
    const remaining = deadline - Date.now();
    if (remaining < 6_000) break;

    try {
      const text = await requestModel(
        model,
        scan,
        prompt,
        opts.signal,
        Math.min(REQUEST_TIMEOUT_MS, remaining),
      );
      return normalize(extractJson(text), langs);
    } catch (error) {
      if (opts.signal?.aborted) throw abortError();
      lastError = error instanceof VisionError ? error : new VisionError('Unknown vision error.');
    }
  }

  const fallback = demoResult(langs);
  return {
    ...fallback,
    notice: `${lastError?.message ?? 'Free cloud AI is busy.'} Switched to the built-in 5-language catalog so you can keep practicing without interruption.`,
  };
}

/** Re-filters a ScanResult's translations when the user toggles active languages. */
export function filterScanTranslations(
  result: ScanResult,
  langs: readonly LangCode[],
): Translation[] {
  const active = langs.length > 0 ? langs : ALL_LANGS;
  const catalogEntry = findCatalogEntry(result.object);
  if (catalogEntry) {
    return catalogTranslations(catalogEntry, active);
  }
  const filtered = active
    .map((code) => result.translations.find((t) => t.code === code))
    .filter((t): t is Translation => Boolean(t));
  return filtered.length > 0 ? filtered : result.translations;
}
