import { demoResult } from './demoCatalog';
import { DEFAULT_LANGS, LANGUAGES, isLangCode, type LangCode } from './languages';
import type { PendingScan, ScanResult, Translation } from './types';

/**
 * Motor de visión gratuito y SIN clave de API.
 *
 * OVHcloud AI Endpoints ofrece un nivel anónimo (sin registro y sin clave) de
 * 2 peticiones por minuto e IP y modelo. Usamos varios modelos de visión en
 * cascada: si uno falla, está saturado o tarda demasiado, probamos el
 * siguiente. Si ninguno responde, la app cae en el catálogo local para que
 * nunca se quede bloqueada.
 */
const ENDPOINT = 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions';

const VISION_MODELS = [
  'Qwen2.5-VL-72B-Instruct',
  'Qwen3.8-27B',
  'Qwen3.5-9B',
  'Qwen3.6-27B',
] as const;

const REQUEST_TIMEOUT_MS = 30_000;
/** Tiempo máximo total antes de caer al catálogo local. */
const OVERALL_BUDGET_MS = 55_000;

type IdentifyOptions = {
  langs?: LangCode[];
  signal?: AbortSignal;
  /** Fuerza el catálogo local sin llamar a la red. */
  demo?: boolean;
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

function buildPrompt(langs: LangCode[]): string {
  const names = langs
    .map((code) => `${code} (${LANGUAGES.find((language) => language.code === code)?.name})`)
    .join(', ');

  return [
    'Eres un experto en lexicografía visual que ayuda a aprender idiomas.',
    'Analiza la imagen y realiza estas tareas:',
    '1. Identifica el objeto principal, el más prominente y reconocible.',
    '2. Devuelve su nombre en español en "object", un emoji en "emoji" y una categoría corta en "category" (Comida, Animal, Mueble, Ropa, Tecnología, Transporte, Naturaleza u Objeto).',
    `3. Traduce ese objeto a estos idiomas: ${names}. Para cada idioma devuelve:`,
    '   - code: el código del idioma.',
    '   - word: el sustantivo en singular, sin artículo.',
    '   - article: el artículo determinado (el/la, the, le/la, der/die/das, il/lo/la/l’).',
    '   - phonetic: pronunciación figurada para un hispanohablante, con la sílaba tónica en MAYÚSCULAS (ejemplo: "man-SÁ-na").',
    '   - example: una frase corta y natural en ese idioma que use la palabra.',
    '4. Devuelve "confidence" con un número entre 0 y 1.',
    'Si no hay un objeto claro, elige el más reconocible y baja la confianza.',
    'Responde SOLO con un objeto JSON válido, sin markdown ni texto adicional, con esta forma:',
    '{"object":"...","emoji":"...","category":"...","confidence":0.9,"translations":[{"code":"es","word":"...","article":"...","phonetic":"...","example":"..."},{"code":"en","word":"...","article":"...","phonetic":"...","example":"..."},{"code":"fr","word":"...","article":"...","phonetic":"...","example":"..."},{"code":"de","word":"...","article":"...","phonetic":"...","example":"..."},{"code":"it","word":"...","article":"...","phonetic":"...","example":"..."}]}',
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
    throw new VisionError('La IA devolvió una respuesta ilegible.');
  }

  cleaned = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new VisionError('La IA devolvió un JSON incompleto.');
  }
}

function normalize(raw: unknown, langs: LangCode[]): ScanResult {
  const data = raw as Partial<ScanResult> | null;
  if (!data || typeof data.object !== 'string' || !Array.isArray(data.translations)) {
    throw new VisionError('La IA devolvió una respuesta inesperada.');
  }

  const translations: Translation[] = [];
  for (const item of data.translations) {
    if (!item || typeof item.word !== 'string' || !isLangCode(String(item.code))) continue;
    const word = item.word.trim();
    if (!word) continue;
    translations.push({
      code: item.code,
      word,
      phonetic: (item.phonetic ?? '').toString().trim() || word,
      article: item.article?.toString().trim(),
      example: item.example?.toString().trim(),
    });
  }

  if (translations.length < 3) {
    throw new VisionError('La traducción llegó incompleta.');
  }

  const sorted = langs
    .map((code) => translations.find((item) => item.code === code))
    .filter((item): item is Translation => Boolean(item));

  const confidence =
    typeof data.confidence === 'number'
      ? data.confidence
      : Number.parseFloat(String(data.confidence ?? '0.85'));

  return {
    object: data.object.trim(),
    emoji: typeof data.emoji === 'string' && data.emoji.length > 0 ? data.emoji.slice(0, 8) : '✨',
    category: typeof data.category === 'string' && data.category.length > 0 ? data.category : 'Objeto',
    confidence: Number.isFinite(confidence) ? Math.min(1, Math.max(0, confidence)) : 0.85,
    translations: sorted.length >= 3 ? sorted : translations,
    source: 'ai',
  };
}

function statusMessage(status: number): string {
  if (status === 429) return 'El servicio gratuito está saturado.';
  if (status === 401 || status === 403) return 'El servicio gratuito rechazó la petición.';
  if (status === 404) return 'El modelo gratuito no está disponible.';
  if (status >= 500) return 'El servicio gratuito no responde.';
  return `El servicio gratuito devolvió un error (${status}).`;
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
        max_tokens: 2000,
        temperature: 0.2,
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
      throw new VisionError('La IA no devolvió ningún resultado.');
    }
    return content;
  } catch (error) {
    if (external?.aborted) throw abortError();
    if ((error as Error).name === 'AbortError') {
      throw new VisionError('La IA tardó demasiado en responder.');
    }
    if (error instanceof VisionError) throw error;
    throw new VisionError('No se pudo conectar con la IA gratuita.');
  } finally {
    clearTimeout(timer);
    external?.removeEventListener('abort', forwardAbort);
  }
}

export async function identifyObject(
  scan: PendingScan,
  opts: IdentifyOptions = {},
): Promise<ScanResult> {
  const langs = opts.langs?.length ? opts.langs : DEFAULT_LANGS;

  if (opts.demo) {
    return demoResult(langs);
  }

  const prompt = buildPrompt(langs);
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
      lastError = error instanceof VisionError ? error : new VisionError('Error desconocido.');
    }
  }

  // Red de seguridad: la app nunca se queda sin respuesta.
  return {
    ...demoResult(langs),
    notice: `${lastError?.message ?? 'La IA gratuita no está disponible.'} Te mostramos un objeto del catálogo local para que puedas seguir practicando.`,
  };
}
