import { DEFAULT_LANGS, LANG_BY_CODE, type LangCode } from './languages';
import type { ScanResult, Translation } from './types';

type CatalogEntry = {
  object: string;
  emoji: string;
  category: string;
  translations: Translation[];
};

export const CATALOG: CatalogEntry[] = [
  {
    object: 'manzana',
    emoji: '🍎',
    category: 'Comida',
    translations: [
      { code: 'es', word: 'manzana', article: 'la', phonetic: 'man-SÁ-na', example: 'Me comí una manzana en el desayuno.' },
      { code: 'en', word: 'apple', article: 'an', phonetic: 'Á-pol', example: 'I ate an apple for breakfast.' },
      { code: 'fr', word: 'pomme', article: 'la', phonetic: 'pom', example: "J'ai mangé une pomme au petit-déjeuner." },
      { code: 'de', word: 'Apfel', article: 'der', phonetic: 'ÁP-fel', example: 'Ich esse einen Apfel zum Frühstück.' },
      { code: 'it', word: 'mela', article: 'la', phonetic: 'MÉ-la', example: 'Ho mangiato una mela a colazione.' },
    ],
  },
  {
    object: 'taza',
    emoji: '☕',
    category: 'Objeto',
    translations: [
      { code: 'es', word: 'taza', article: 'la', phonetic: 'TÁ-sa', example: 'Esta taza es de cerámica.' },
      { code: 'en', word: 'cup', article: 'a', phonetic: 'cap', example: 'This cup is made of ceramic.' },
      { code: 'fr', word: 'tasse', article: 'la', phonetic: 'tas', example: 'Cette tasse est en céramique.' },
      { code: 'de', word: 'Tasse', article: 'die', phonetic: 'TÁ-se', example: 'Diese Tasse ist aus Keramik.' },
      { code: 'it', word: 'tazza', article: 'la', phonetic: 'TÁT-tsa', example: 'Questa tazza è di ceramica.' },
    ],
  },
  {
    object: 'silla',
    emoji: '🪑',
    category: 'Mueble',
    translations: [
      { code: 'es', word: 'silla', article: 'la', phonetic: 'SÍ-ya', example: 'Siéntate en la silla.' },
      { code: 'en', word: 'chair', article: 'a', phonetic: 'cher', example: 'Sit on the chair, please.' },
      { code: 'fr', word: 'chaise', article: 'la', phonetic: 'shes', example: 'Assieds-toi sur la chaise.' },
      { code: 'de', word: 'Stuhl', article: 'der', phonetic: 'shtul', example: 'Setz dich auf den Stuhl.' },
      { code: 'it', word: 'sedia', article: 'la', phonetic: 'SÉ-dia', example: 'Siediti sulla sedia.' },
    ],
  },
  {
    object: 'perro',
    emoji: '🐶',
    category: 'Animal',
    translations: [
      { code: 'es', word: 'perro', article: 'el', phonetic: 'PÉ-rro', example: 'Mi perro corre en el parque.' },
      { code: 'en', word: 'dog', article: 'a', phonetic: 'dog', example: 'My dog runs in the park.' },
      { code: 'fr', word: 'chien', article: 'le', phonetic: 'shian', example: 'Mon chien court dans le parc.' },
      { code: 'de', word: 'Hund', article: 'der', phonetic: 'jund', example: 'Mein Hund läuft im Park.' },
      { code: 'it', word: 'cane', article: 'il', phonetic: 'KÁ-ne', example: 'Il mio cane corre al parco.' },
    ],
  },
  {
    object: 'gato',
    emoji: '🐱',
    category: 'Animal',
    translations: [
      { code: 'es', word: 'gato', article: 'el', phonetic: 'GÁ-to', example: 'El gato duerme en el sofá.' },
      { code: 'en', word: 'cat', article: 'a', phonetic: 'cat', example: 'The cat sleeps on the sofa.' },
      { code: 'fr', word: 'chat', article: 'le', phonetic: 'sha', example: 'Le chat dort sur le canapé.' },
      { code: 'de', word: 'Katze', article: 'die', phonetic: 'KÁ-tse', example: 'Die Katze schläft auf dem Sofa.' },
      { code: 'it', word: 'gatto', article: 'il', phonetic: 'GÁT-to', example: 'Il gatto dorme sul divano.' },
    ],
  },
  {
    object: 'libro',
    emoji: '📚',
    category: 'Objeto',
    translations: [
      { code: 'es', word: 'libro', article: 'el', phonetic: 'LÍ-bro', example: 'Estoy leyendo un libro nuevo.' },
      { code: 'en', word: 'book', article: 'a', phonetic: 'buk', example: 'I am reading a new book.' },
      { code: 'fr', word: 'livre', article: 'le', phonetic: 'livr', example: 'Je lis un nouveau livre.' },
      { code: 'de', word: 'Buch', article: 'das', phonetic: 'buj', example: 'Ich lese ein neues Buch.' },
      { code: 'it', word: 'libro', article: 'il', phonetic: 'LÍ-bro', example: 'Sto leggendo un nuovo libro.' },
    ],
  },
  {
    object: 'mesa',
    emoji: '🪵',
    category: 'Mueble',
    translations: [
      { code: 'es', word: 'mesa', article: 'la', phonetic: 'MÉ-sa', example: 'Pon los platos en la mesa.' },
      { code: 'en', word: 'table', article: 'a', phonetic: 'TÉI-bol', example: 'Put the plates on the table.' },
      { code: 'fr', word: 'table', article: 'la', phonetic: 'tabl', example: 'Mets les assiettes sur la table.' },
      { code: 'de', word: 'Tisch', article: 'der', phonetic: 'tish', example: 'Stell die Teller auf den Tisch.' },
      { code: 'it', word: 'tavolo', article: 'il', phonetic: 'TÁ-vo-lo', example: 'Metti i piatti sul tavolo.' },
    ],
  },
  {
    object: 'reloj',
    emoji: '⌚',
    category: 'Objeto',
    translations: [
      { code: 'es', word: 'reloj', article: 'el', phonetic: 're-LÓJ', example: 'Mi reloj marca las tres.' },
      { code: 'en', word: 'clock', article: 'a', phonetic: 'clok', example: 'The clock says three o’clock.' },
      { code: 'fr', word: 'horloge', article: 'la', phonetic: 'or-LOZH', example: 'L’horloge indique trois heures.' },
      { code: 'de', word: 'Uhr', article: 'die', phonetic: 'ur', example: 'Die Uhr zeigt drei Uhr an.' },
      { code: 'it', word: 'orologio', article: 'l’', phonetic: 'o-ro-LÓ-yo', example: 'L’orologio segna le tre.' },
    ],
  },
  {
    object: 'llave',
    emoji: '🔑',
    category: 'Objeto',
    translations: [
      { code: 'es', word: 'llave', article: 'la', phonetic: 'YÁ-ve', example: 'Olvidé la llave en casa.' },
      { code: 'en', word: 'key', article: 'a', phonetic: 'kii', example: 'I left the key at home.' },
      { code: 'fr', word: 'clé', article: 'la', phonetic: 'kle', example: "J'ai oublié la clé à la maison." },
      { code: 'de', word: 'Schlüssel', article: 'der', phonetic: 'SHLÚ-sel', example: 'Ich habe den Schlüssel zu Hause vergessen.' },
      { code: 'it', word: 'chiave', article: 'la', phonetic: 'KYÁ-ve', example: 'Ho dimenticato la chiave a casa.' },
    ],
  },
  {
    object: 'zapato',
    emoji: '👟',
    category: 'Ropa',
    translations: [
      { code: 'es', word: 'zapato', article: 'el', phonetic: 'sa-PÁ-to', example: 'Este zapato es muy cómodo.' },
      { code: 'en', word: 'shoe', article: 'a', phonetic: 'shu', example: 'This shoe is very comfortable.' },
      { code: 'fr', word: 'chaussure', article: 'la', phonetic: 'sho-SÜR', example: 'Cette chaussure est très confortable.' },
      { code: 'de', word: 'Schuh', article: 'der', phonetic: 'shu', example: 'Dieser Schuh ist sehr bequem.' },
      { code: 'it', word: 'scarpa', article: 'la', phonetic: 'SKÁR-pa', example: 'Questa scarpa è molto comoda.' },
    ],
  },
  {
    object: 'flor',
    emoji: '🌸',
    category: 'Naturaleza',
    translations: [
      { code: 'es', word: 'flor', article: 'la', phonetic: 'flor', example: 'La flor huele muy bien.' },
      { code: 'en', word: 'flower', article: 'a', phonetic: 'FLÁU-er', example: 'The flower smells lovely.' },
      { code: 'fr', word: 'fleur', article: 'la', phonetic: 'flör', example: 'La fleur sent très bon.' },
      { code: 'de', word: 'Blume', article: 'die', phonetic: 'BLÚ-me', example: 'Die Blume riecht wunderbar.' },
      { code: 'it', word: 'fiore', article: 'il', phonetic: 'FIÓ-re', example: 'Il fiore profuma molto.' },
    ],
  },
  {
    object: 'botella',
    emoji: '🍾',
    category: 'Objeto',
    translations: [
      { code: 'es', word: 'botella', article: 'la', phonetic: 'bo-TÉ-ya', example: 'Llena la botella de agua.' },
      { code: 'en', word: 'bottle', article: 'a', phonetic: 'BÓ-tl', example: 'Fill the bottle with water.' },
      { code: 'fr', word: 'bouteille', article: 'la', phonetic: 'bu-TÉI', example: "Remplis la bouteille d'eau." },
      { code: 'de', word: 'Flasche', article: 'die', phonetic: 'FLÁ-she', example: 'Füll die Flasche mit Wasser.' },
      { code: 'it', word: 'bottiglia', article: 'la', phonetic: 'bot-TÍ-lya', example: "Riempi la bottiglia d'acqua." },
    ],
  },
  {
    object: 'teléfono',
    emoji: '📱',
    category: 'Tecnología',
    translations: [
      { code: 'es', word: 'teléfono', article: 'el', phonetic: 'te-LÉ-fo-no', example: 'Mi teléfono está sin batería.' },
      { code: 'en', word: 'phone', article: 'a', phonetic: 'foun', example: 'My phone is out of battery.' },
      { code: 'fr', word: 'téléphone', article: 'le', phonetic: 'te-le-FON', example: 'Mon téléphone est déchargé.' },
      { code: 'de', word: 'Telefon', article: 'das', phonetic: 'te-le-FÓN', example: 'Mein Telefon hat keinen Akku mehr.' },
      { code: 'it', word: 'telefono', article: 'il', phonetic: 'te-LÉ-fo-no', example: 'Il mio telefono è scarico.' },
    ],
  },
  {
    object: 'coche',
    emoji: '🚗',
    category: 'Transporte',
    translations: [
      { code: 'es', word: 'coche', article: 'el', phonetic: 'KÓ-che', example: 'El coche está en el garaje.' },
      { code: 'en', word: 'car', article: 'a', phonetic: 'kar', example: 'The car is in the garage.' },
      { code: 'fr', word: 'voiture', article: 'la', phonetic: 'vua-TÜR', example: 'La voiture est dans le garage.' },
      { code: 'de', word: 'Auto', article: 'das', phonetic: 'ÁU-to', example: 'Das Auto steht in der Garage.' },
      { code: 'it', word: 'auto', article: 'l’', phonetic: 'ÁU-to', example: "L'auto è in garage." },
    ],
  },
  {
    object: 'sol',
    emoji: '☀️',
    category: 'Naturaleza',
    translations: [
      { code: 'es', word: 'sol', article: 'el', phonetic: 'sol', example: 'El sol brilla hoy.' },
      { code: 'en', word: 'sun', article: 'the', phonetic: 'san', example: 'The sun is shining today.' },
      { code: 'fr', word: 'soleil', article: 'le', phonetic: 'so-LÉI', example: 'Le soleil brille aujourd’hui.' },
      { code: 'de', word: 'Sonne', article: 'die', phonetic: 'ZÓ-ne', example: 'Die Sonne scheint heute.' },
      { code: 'it', word: 'sole', article: 'il', phonetic: 'SÓ-le', example: 'Il sole splende oggi.' },
    ],
  },
  {
    object: 'agua',
    emoji: '💧',
    category: 'Naturaleza',
    translations: [
      { code: 'es', word: 'agua', article: 'el', phonetic: 'Á-gua', example: 'Bebo mucha agua al día.' },
      { code: 'en', word: 'water', article: 'the', phonetic: 'UÓ-ter', example: 'I drink a lot of water every day.' },
      { code: 'fr', word: 'eau', article: 'l’', phonetic: 'o', example: 'Je bois beaucoup d’eau chaque jour.' },
      { code: 'de', word: 'Wasser', article: 'das', phonetic: 'VÁ-ser', example: 'Ich trinke jeden Tag viel Wasser.' },
      { code: 'it', word: 'acqua', article: 'l’', phonetic: 'ÁK-kua', example: 'Bevo molta acqua ogni giorno.' },
    ],
  },
  {
    object: 'café',
    emoji: '☕',
    category: 'Bebida',
    translations: [
      { code: 'es', word: 'café', article: 'el', phonetic: 'ka-FÉ', example: 'Un café con leche, por favor.' },
      { code: 'en', word: 'coffee', article: 'a', phonetic: 'KÓ-fi', example: 'A coffee with milk, please.' },
      { code: 'fr', word: 'café', article: 'le', phonetic: 'ka-FÉ', example: 'Un café au lait, s’il vous plaît.' },
      { code: 'de', word: 'Kaffee', article: 'der', phonetic: 'ka-FÉ', example: 'Einen Kaffee mit Milch, bitte.' },
      { code: 'it', word: 'caffè', article: 'il', phonetic: 'kaf-FÉ', example: 'Un caffè con latte, per favore.' },
    ],
  },
  {
    object: 'ventana',
    emoji: '🪟',
    category: 'Objeto',
    translations: [
      { code: 'es', word: 'ventana', article: 'la', phonetic: 'ben-TÁ-na', example: 'Abre la ventana, hace calor.' },
      { code: 'en', word: 'window', article: 'a', phonetic: 'UÍN-dou', example: 'Open the window, it’s hot.' },
      { code: 'fr', word: 'fenêtre', article: 'la', phonetic: 'fe-NÉTR', example: 'Ouvre la fenêtre, il fait chaud.' },
      { code: 'de', word: 'Fenster', article: 'das', phonetic: 'FÉNS-ter', example: 'Öffne das Fenster, es ist warm.' },
      { code: 'it', word: 'finestra', article: 'la', phonetic: 'fi-NÉS-tra', example: 'Apri la finestra, fa caldo.' },
    ],
  },
];

export function demoResult(langs: LangCode[] = DEFAULT_LANGS): ScanResult {
  const entry = CATALOG[Math.floor(Math.random() * CATALOG.length)];
  const translations = langs
    .map((code) => entry.translations.find((item) => item.code === code))
    .filter((item): item is Translation => Boolean(item));

  return {
    object: entry.object,
    emoji: entry.emoji,
    category: entry.category,
    confidence: 0.86 + Math.random() * 0.12,
    translations: translations.length
      ? translations
      : entry.translations.map((item) => ({ ...item, code: item.code as LangCode })),
    source: 'demo',
  };
}

export function translationFor(object: string, code: LangCode): Translation | undefined {
  const entry = CATALOG.find((item) => item.object === object);
  return entry?.translations.find((item) => item.code === code);
}

export function catalogEmoji(object: string): string {
  return CATALOG.find((item) => item.object === object)?.emoji ?? '✨';
}

export function languageLabel(code: LangCode): string {
  return LANG_BY_CODE[code]?.name ?? code.toUpperCase();
}
