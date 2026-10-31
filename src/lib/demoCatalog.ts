import { ALL_LANGS, LANG_BY_CODE, type LangCode } from './languages';
import type { Category, DailyMatch, ScanResult, Translation } from './types';

export type CatalogEntry = {
  id: string;
  /** Canonical English object name (lowercase, singular). */
  object: string;
  emoji: string;
  category: Category;
  /** Synonyms and closely related words that count as a Word of the Day match. */
  aliases: string[];
  /** Translations in all 5 mandatory languages: es, en, ja, hi, zh. */
  translations: Translation[];
  /** Witty, object-specific comments voiced by Kamu right after a photo is taken. */
  quips: string[];
};

export const CATALOG: CatalogEntry[] = [
  {
    id: 'apple',
    object: 'apple',
    emoji: '🍎',
    category: 'Food',
    aliases: ['apple', 'apples', 'red apple', 'green apple', 'fruit', 'manzana'],
    quips: [
      'An apple! Doctors everywhere just backed away slowly from your phone.',
      'Crisp, round, and photogenic—this apple poses better than most influencers.',
      'Newton got gravity from an apple; you get five languages. Fair trade.',
    ],
    translations: [
      {
        code: 'es',
        word: 'manzana',
        romanization: 'manzana',
        phonetic: 'mahn-SAH-nah',
        article: 'la',
        example: 'Me comí una manzana roja en el desayuno.',
        exampleMeaning: 'I ate a red apple for breakfast.',
      },
      {
        code: 'en',
        word: 'apple',
        romanization: 'apple',
        phonetic: 'AP-uhl',
        article: 'an',
        example: 'She packed a crisp apple in her bag.',
        exampleMeaning: 'She packed a crisp apple in her bag.',
      },
      {
        code: 'ja',
        word: 'りんご',
        romanization: 'ringo',
        phonetic: 'reen-goh',
        example: '毎朝りんごを一つ食べます。',
        exampleMeaning: 'I eat one apple every morning.',
      },
      {
        code: 'hi',
        word: 'सेब',
        romanization: 'seb',
        phonetic: 'SAYB',
        example: 'यह लाल सेब बहुत मीठा है।',
        exampleMeaning: 'This red apple is very sweet.',
      },
      {
        code: 'zh',
        word: '苹果',
        romanization: 'píngguǒ',
        phonetic: 'ping-gwoh',
        article: '个',
        example: '桌子上有一个红苹果。',
        exampleMeaning: 'There is a red apple on the table.',
      },
    ],
  },
  {
    id: 'coffee',
    object: 'coffee',
    emoji: '☕',
    category: 'Drink',
    aliases: ['coffee', 'espresso', 'latte', 'cappuccino', 'coffee mug', 'cafe', 'café'],
    quips: [
      'Liquid ambition detected. My single chameleon eye dilated just looking at that caffeine.',
      'Ah, coffee—the only reason either of us is awake enough to conjugate verbs today.',
      'Even through the camera lens I can tell this brew is carrying your entire schedule.',
    ],
    translations: [
      {
        code: 'es',
        word: 'café',
        romanization: 'café',
        phonetic: 'kah-FEH',
        article: 'el',
        example: 'Un café caliente por la mañana, por favor.',
        exampleMeaning: 'A hot coffee in the morning, please.',
      },
      {
        code: 'en',
        word: 'coffee',
        romanization: 'coffee',
        phonetic: 'KAW-fee',
        article: 'a',
        example: 'I need a strong coffee before the meeting.',
        exampleMeaning: 'I need a strong coffee before the meeting.',
      },
      {
        code: 'ja',
        word: 'コーヒー',
        romanization: 'kōhī',
        phonetic: 'koh-hee',
        example: 'ホットコーヒーを一杯ください。',
        exampleMeaning: 'One cup of hot coffee, please.',
      },
      {
        code: 'hi',
        word: 'कॉफ़ी',
        romanization: 'kŏfī',
        phonetic: 'KAW-fee',
        example: 'मुझे सुबह गरम कॉफ़ी पसंद है।',
        exampleMeaning: 'I like hot coffee in the morning.',
      },
      {
        code: 'zh',
        word: '咖啡',
        romanization: 'kāfēi',
        phonetic: 'kah-fay',
        article: '杯',
        example: '我想喝一杯热咖啡。',
        exampleMeaning: 'I would like to drink a cup of hot coffee.',
      },
    ],
  },
  {
    id: 'cup',
    object: 'cup',
    emoji: '🍵',
    category: 'Object',
    aliases: ['cup', 'cups', 'mug', 'teacup', 'ceramic cup', 'taza'],
    quips: [
      'A noble cup! Half full if you study daily, half empty if you skip pronunciation.',
      'Look at that handle ergonomics. Ten out of ten, would sip vocabulary from it.',
      'A humble cup holding your beverage and your multilingual ambitions together.',
    ],
    translations: [
      {
        code: 'es',
        word: 'taza',
        romanization: 'taza',
        phonetic: 'TAH-sah',
        article: 'la',
        example: 'Esta taza de cerámica conserva el calor.',
        exampleMeaning: 'This ceramic cup keeps the heat.',
      },
      {
        code: 'en',
        word: 'cup',
        romanization: 'cup',
        phonetic: 'KUP',
        article: 'a',
        example: 'Pour the tea into a clean cup.',
        exampleMeaning: 'Pour the tea into a clean cup.',
      },
      {
        code: 'ja',
        word: 'カップ',
        romanization: 'kappu',
        phonetic: 'kahp-poo',
        example: 'この白いカップはお気に入りです。',
        exampleMeaning: 'This white cup is my favorite.',
      },
      {
        code: 'hi',
        word: 'कप',
        romanization: 'kap',
        phonetic: 'KUP',
        example: 'मेज़ पर चाय का कप रखा है।',
        exampleMeaning: 'A cup of tea is on the table.',
      },
      {
        code: 'zh',
        word: '杯子',
        romanization: 'bēizi',
        phonetic: 'bay-dzuh',
        article: '个',
        example: '这个杯子是陶瓷做的。',
        exampleMeaning: 'This cup is made of ceramic.',
      },
    ],
  },
  {
    id: 'book',
    object: 'book',
    emoji: '📚',
    category: 'Object',
    aliases: ['book', 'books', 'novel', 'notebook', 'textbook', 'hardcover', 'libro'],
    quips: [
      'A paper book! An ancient Wi-Fi-free tablet filled with thousands of words.',
      'Careful, if you open that book AND use LingoLens, your brain might level up twice.',
      'Judging this book by its cover: 100% chance it makes you look smarter on the feed.',
    ],
    translations: [
      {
        code: 'es',
        word: 'libro',
        romanization: 'libro',
        phonetic: 'LEE-broh',
        article: 'el',
        example: 'Estoy leyendo un libro muy interesante.',
        exampleMeaning: 'I am reading a very interesting book.',
      },
      {
        code: 'en',
        word: 'book',
        romanization: 'book',
        phonetic: 'BOOK',
        article: 'a',
        example: 'She borrowed a new book from the library.',
        exampleMeaning: 'She borrowed a new book from the library.',
      },
      {
        code: 'ja',
        word: '本',
        romanization: 'hon',
        phonetic: 'hohn',
        example: '寝る前にこの本を読みます。',
        exampleMeaning: 'I read this book before going to sleep.',
      },
      {
        code: 'hi',
        word: 'किताब',
        romanization: 'kitāb',
        phonetic: 'kih-TAHB',
        example: 'यह किताब बहुत ज्ञानवर्धक है।',
        exampleMeaning: 'This book is very informative.',
      },
      {
        code: 'zh',
        word: '书',
        romanization: 'shū',
        phonetic: 'shoo',
        article: '本',
        example: '我今天买了一本新书。',
        exampleMeaning: 'I bought a new book today.',
      },
    ],
  },
  {
    id: 'chair',
    object: 'chair',
    emoji: '🪑',
    category: 'Furniture',
    aliases: ['chair', 'chairs', 'armchair', 'office chair', 'seat', 'stool', 'silla'],
    quips: [
      'Four legs, zero complaints. That chair supports you almost as much as I do.',
      'Bold composition! You turned an ordinary chair into modern furniture art.',
      'Take a seat and repeat the Japanese pronunciation for me—I am listening.',
    ],
    translations: [
      {
        code: 'es',
        word: 'silla',
        romanization: 'silla',
        phonetic: 'SEE-yah',
        article: 'la',
        example: 'Siéntate en la silla junto a la ventana.',
        exampleMeaning: 'Sit on the chair next to the window.',
      },
      {
        code: 'en',
        word: 'chair',
        romanization: 'chair',
        phonetic: 'CHAIR',
        article: 'a',
        example: 'Pull up a chair and join the conversation.',
        exampleMeaning: 'Pull up a chair and join the conversation.',
      },
      {
        code: 'ja',
        word: '椅子',
        romanization: 'isu',
        phonetic: 'ee-soo',
        example: 'どうぞこの椅子に座ってください。',
        exampleMeaning: 'Please sit down on this chair.',
      },
      {
        code: 'hi',
        word: 'कुर्सी',
        romanization: 'kursī',
        phonetic: 'koor-SEE',
        example: 'कृपया इस कुर्सी पर बैठिए।',
        exampleMeaning: 'Please sit on this chair.',
      },
      {
        code: 'zh',
        word: '椅子',
        romanization: 'yǐzi',
        phonetic: 'yee-dzuh',
        article: '把',
        example: '请坐在这把椅子上。',
        exampleMeaning: 'Please sit on this chair.',
      },
    ],
  },
  {
    id: 'table',
    object: 'table',
    emoji: '🪵',
    category: 'Furniture',
    aliases: ['table', 'tables', 'desk', 'dining table', 'coffee table', 'mesa'],
    quips: [
      'A sturdy table—humanity’s favorite flat surface for putting keys down and losing them.',
      'Look at that tabletop grain. Solid craftsmanship, solid vocabulary choice.',
      'Now you can bring five languages to the table—literally.',
    ],
    translations: [
      {
        code: 'es',
        word: 'mesa',
        romanization: 'mesa',
        phonetic: 'MEH-sah',
        article: 'la',
        example: 'La cena ya está servida en la mesa.',
        exampleMeaning: 'Dinner is already served on the table.',
      },
      {
        code: 'en',
        word: 'table',
        romanization: 'table',
        phonetic: 'TAY-buhl',
        article: 'a',
        example: 'We booked a table for two by the terrace.',
        exampleMeaning: 'We booked a table for two by the terrace.',
      },
      {
        code: 'ja',
        word: 'テーブル',
        romanization: 'tēburu',
        phonetic: 'teh-boo-roo',
        example: 'テーブルの上に鍵があります。',
        exampleMeaning: 'The keys are on the table.',
      },
      {
        code: 'hi',
        word: 'मेज़',
        romanization: 'mez',
        phonetic: 'MAYZ',
        example: 'किताबें लकड़ी की मेज़ पर हैं।',
        exampleMeaning: 'The books are on the wooden table.',
      },
      {
        code: 'zh',
        word: '桌子',
        romanization: 'zhuōzi',
        phonetic: 'jwoh-dzuh',
        article: '张',
        example: '请把碗放在桌子上。',
        exampleMeaning: 'Please put the bowls on the table.',
      },
    ],
  },
  {
    id: 'dog',
    object: 'dog',
    emoji: '🐶',
    category: 'Animal',
    aliases: ['dog', 'dogs', 'puppy', 'hound', 'canine', 'perro'],
    quips: [
      '12/10 good dog! Honestly, this pup deserves half of the XP you just earned.',
      'Hold still! Even my chameleon reflexes struggle with a tail wagging that fast.',
      'That dog understands “treat” in five languages already; time for you to catch up.',
    ],
    translations: [
      {
        code: 'es',
        word: 'perro',
        romanization: 'perro',
        phonetic: 'PEH-rroh',
        article: 'el',
        example: 'El perro corre feliz por el parque.',
        exampleMeaning: 'The dog runs happily through the park.',
      },
      {
        code: 'en',
        word: 'dog',
        romanization: 'dog',
        phonetic: 'DAWG',
        article: 'a',
        example: 'Our friendly dog loves long evening walks.',
        exampleMeaning: 'Our friendly dog loves long evening walks.',
      },
      {
        code: 'ja',
        word: '犬',
        romanization: 'inu',
        phonetic: 'ee-noo',
        example: 'その犬はとても元気ですね。',
        exampleMeaning: 'That dog is very energetic.',
      },
      {
        code: 'hi',
        word: 'कुत्ता',
        romanization: 'kuttā',
        phonetic: 'koot-TAH',
        example: 'मेरा कुत्ता बगीचे में खेल रहा है।',
        exampleMeaning: 'My dog is playing in the garden.',
      },
      {
        code: 'zh',
        word: '狗',
        romanization: 'gǒu',
        phonetic: 'goh',
        article: '只',
        example: '这只小狗非常聪明。',
        exampleMeaning: 'This puppy is very smart.',
      },
    ],
  },
  {
    id: 'cat',
    object: 'cat',
    emoji: '🐱',
    category: 'Animal',
    aliases: ['cat', 'cats', 'kitten', 'feline', 'kitty', 'gato'],
    quips: [
      'A cat! Notice how it glares at your Pixel lens with pure aristocratic superiority.',
      'Two apex creatures of judgment in one screen: that cat and me, Kamu.',
      'You did not photograph this cat—the cat graciously allowed an audience.',
    ],
    translations: [
      {
        code: 'es',
        word: 'gato',
        romanization: 'gato',
        phonetic: 'GAH-toh',
        article: 'el',
        example: 'El gato duerme tranquilo en el sofá.',
        exampleMeaning: 'The cat sleeps peacefully on the sofa.',
      },
      {
        code: 'en',
        word: 'cat',
        romanization: 'cat',
        phonetic: 'KAT',
        article: 'a',
        example: 'The curious cat jumped onto the windowsill.',
        exampleMeaning: 'The curious cat jumped onto the windowsill.',
      },
      {
        code: 'ja',
        word: '猫',
        romanization: 'neko',
        phonetic: 'neh-koh',
        example: '猫が日なたで昼寝をしています。',
        exampleMeaning: 'The cat is napping in the sun.',
      },
      {
        code: 'hi',
        word: 'बिल्ली',
        romanization: 'billī',
        phonetic: 'bil-LEE',
        example: 'बिल्ली सोफ़े पर सो रही है।',
        exampleMeaning: 'The cat is sleeping on the sofa.',
      },
      {
        code: 'zh',
        word: '猫',
        romanization: 'māo',
        phonetic: 'maow',
        article: '只',
        example: '那只猫喜欢晒太阳。',
        exampleMeaning: 'That cat likes to bask in the sun.',
      },
    ],
  },
  {
    id: 'phone',
    object: 'phone',
    emoji: '📱',
    category: 'Tech',
    aliases: ['phone', 'smartphone', 'cellphone', 'mobile phone', 'pixel', 'iphone', 'teléfono'],
    quips: [
      'Using a phone to photograph a phone? That is peak 21st-century inception.',
      'Careful—if two phones look at each other too long they start gossiping in binary.',
      'Sleek glass rectangle! Almost as handsome as my Pixel 9 Pro XL home.',
    ],
    translations: [
      {
        code: 'es',
        word: 'teléfono',
        romanization: 'teléfono',
        phonetic: 'teh-LEH-foh-noh',
        article: 'el',
        example: 'Mi teléfono tiene la batería al cien por ciento.',
        exampleMeaning: 'My phone battery is at one hundred percent.',
      },
      {
        code: 'en',
        word: 'phone',
        romanization: 'phone',
        phonetic: 'FOHN',
        article: 'a',
        example: 'She used her phone to scan the street sign.',
        exampleMeaning: 'She used her phone to scan the street sign.',
      },
      {
        code: 'ja',
        word: '電話',
        romanization: 'denwa',
        phonetic: 'dehn-wah',
        example: '新しい電話のカメラはとても綺麗です。',
        exampleMeaning: 'The camera on my new phone is very clear.',
      },
      {
        code: 'hi',
        word: 'फ़ोन',
        romanization: 'fon',
        phonetic: 'FOHN',
        example: 'मेरा फ़ोन मेज़ पर चार्ज हो रहा है।',
        exampleMeaning: 'My phone is charging on the table.',
      },
      {
        code: 'zh',
        word: '手机',
        romanization: 'shǒujī',
        phonetic: 'shoh-jee',
        article: '部',
        example: '这部手机拍照非常清晰。',
        exampleMeaning: 'This mobile phone takes very clear photos.',
      },
    ],
  },
  {
    id: 'laptop',
    object: 'laptop',
    emoji: '💻',
    category: 'Tech',
    aliases: ['laptop', 'computer', 'notebook computer', 'macbook', 'pc', 'keyboard', 'portátil'],
    quips: [
      'A laptop! Currently running 47 browser tabs and your dreams of fluency.',
      'Close the spreadsheets for two minutes and pronounce this in Mandarin for me.',
      'Clean keyboard! My chameleon toes approve of this workstation.',
    ],
    translations: [
      {
        code: 'es',
        word: 'portátil',
        romanization: 'portátil',
        phonetic: 'por-TAH-teel',
        article: 'el',
        example: 'Trabajo desde casa con mi portátil nuevo.',
        exampleMeaning: 'I work from home with my new laptop.',
      },
      {
        code: 'en',
        word: 'laptop',
        romanization: 'laptop',
        phonetic: 'LAP-top',
        article: 'a',
        example: 'He opened his laptop at the coffee shop.',
        exampleMeaning: 'He opened his laptop at the coffee shop.',
      },
      {
        code: 'ja',
        word: 'ノートパソコン',
        romanization: 'nōto pasokon',
        phonetic: 'noh-toh pah-soh-kohn',
        example: 'カフェでノートパソコンを開きました。',
        exampleMeaning: 'I opened my laptop at the café.',
      },
      {
        code: 'hi',
        word: 'लैपटॉप',
        romanization: 'laipṭŏp',
        phonetic: 'LAP-top',
        example: 'मैं अपने लैपटॉप पर काम कर रहा हूँ।',
        exampleMeaning: 'I am working on my laptop.',
      },
      {
        code: 'zh',
        word: '笔记本电脑',
        romanization: 'bǐjìběn diànnǎo',
        phonetic: 'bee-jee-ben dyen-naow',
        article: '台',
        example: '这台笔记本电脑又轻又快。',
        exampleMeaning: 'This laptop is both light and fast.',
      },
    ],
  },
  {
    id: 'key',
    object: 'key',
    emoji: '🔑',
    category: 'Object',
    aliases: ['key', 'keys', 'keychain', 'house key', 'car key', 'llave'],
    quips: [
      'You photographed your keys! Smart—now you have proof of where you left them.',
      'This little metal key unlocks doors; pronouncing it unlocks +15 XP.',
      'Shiny! If I had pockets on my chameleon scales, I would still lose my keys.',
    ],
    translations: [
      {
        code: 'es',
        word: 'llave',
        romanization: 'llave',
        phonetic: 'YAH-veh',
        article: 'la',
        example: 'Guardé la llave de casa en el bolsillo.',
        exampleMeaning: 'I kept the house key in my pocket.',
      },
      {
        code: 'en',
        word: 'key',
        romanization: 'key',
        phonetic: 'KEE',
        article: 'a',
        example: 'Practice is the key to mastering any language.',
        exampleMeaning: 'Practice is the key to mastering any language.',
      },
      {
        code: 'ja',
        word: '鍵',
        romanization: 'kagi',
        phonetic: 'kah-gee',
        example: '部屋の鍵をポケットに入れました。',
        exampleMeaning: 'I put the room key in my pocket.',
      },
      {
        code: 'hi',
        word: 'चाबी',
        romanization: 'chābī',
        phonetic: 'chah-BEE',
        example: 'घर की चाबी कहाँ रखी है?',
        exampleMeaning: 'Where is the house key kept?',
      },
      {
        code: 'zh',
        word: '钥匙',
        romanization: 'yàoshi',
        phonetic: 'yaow-shuh',
        article: '把',
        example: '我把钥匙放在包里了。',
        exampleMeaning: 'I put the key inside my bag.',
      },
    ],
  },
  {
    id: 'clock',
    object: 'clock',
    emoji: '⌚',
    category: 'Object',
    aliases: ['clock', 'watch', 'wristwatch', 'alarm clock', 'smartwatch', 'timepiece', 'reloj'],
    quips: [
      'Tick-tock! According to that clock, it is officially vocabulary o’clock.',
      'Time flies when you are flexing a multi-week photo streak.',
      'A classic timepiece! And you caught it right on the second.',
    ],
    translations: [
      {
        code: 'es',
        word: 'reloj',
        romanization: 'reloj',
        phonetic: 'reh-LOHKH',
        article: 'el',
        example: 'Mi reloj marca las ocho en punto.',
        exampleMeaning: 'My clock reads eight o’clock sharp.',
      },
      {
        code: 'en',
        word: 'clock',
        romanization: 'clock',
        phonetic: 'KLOK',
        article: 'a',
        example: 'The wall clock chimes every hour.',
        exampleMeaning: 'The wall clock chimes every hour.',
      },
      {
        code: 'ja',
        word: '時計',
        romanization: 'tokei',
        phonetic: 'toh-kay',
        example: 'その時計はいつも正確です。',
        exampleMeaning: 'That clock is always accurate.',
      },
      {
        code: 'hi',
        word: 'घड़ी',
        romanization: 'ghaṛī',
        phonetic: 'ghuh-REE',
        example: 'दीवार पर एक सुंदर घड़ी लगी है।',
        exampleMeaning: 'A beautiful clock is hanging on the wall.',
      },
      {
        code: 'zh',
        word: '时钟',
        romanization: 'shízhōng',
        phonetic: 'shih-jong',
        article: '个',
        example: '墙上的时钟指着三点。',
        exampleMeaning: 'The clock on the wall points to three o’clock.',
      },
    ],
  },
  {
    id: 'shoe',
    object: 'shoe',
    emoji: '👟',
    category: 'Clothing',
    aliases: ['shoe', 'shoes', 'sneaker', 'sneakers', 'boot', 'footwear', 'trainer', 'zapato'],
    quips: [
      'Fresh kicks! Walking a mile in five languages starts with a single shoe.',
      'Great angle on that sneaker—streetwear magazine editors are taking notes.',
      'Glad I walk on branches barefoot; tying shoelaces with chameleon claws is rough.',
    ],
    translations: [
      {
        code: 'es',
        word: 'zapato',
        romanization: 'zapato',
        phonetic: 'sah-PAH-toh',
        article: 'el',
        example: 'Este zapato deportivo es muy cómodo.',
        exampleMeaning: 'This athletic shoe is very comfortable.',
      },
      {
        code: 'en',
        word: 'shoe',
        romanization: 'shoe',
        phonetic: 'SHOO',
        article: 'a',
        example: 'He tied his running shoe before the race.',
        exampleMeaning: 'He tied his running shoe before the race.',
      },
      {
        code: 'ja',
        word: '靴',
        romanization: 'kutsu',
        phonetic: 'koo-tsoo',
        example: '新しい靴を履いて出かけましょう。',
        exampleMeaning: 'Let’s put on new shoes and go out.',
      },
      {
        code: 'hi',
        word: 'जूता',
        romanization: 'jūtā',
        phonetic: 'joo-TAH',
        example: 'यह जूता चलने में बहुत आरामदायक है।',
        exampleMeaning: 'This shoe is very comfortable for walking.',
      },
      {
        code: 'zh',
        word: '鞋',
        romanization: 'xié',
        phonetic: 'shyeh',
        article: '双',
        example: '这双运动鞋穿起来很舒服。',
        exampleMeaning: 'This pair of sneakers is very comfortable to wear.',
      },
    ],
  },
  {
    id: 'flower',
    object: 'flower',
    emoji: '🌸',
    category: 'Nature',
    aliases: ['flower', 'flowers', 'blossom', 'rose', 'tulip', 'daisy', 'plant', 'petal', 'flor'],
    quips: [
      'A flower! Look at me blending my scales right into those petals.',
      'Nature’s own color palette—and your lens caught every detail.',
      'Stop and smell the flowers, then pronounce them in Hindi and Japanese.',
    ],
    translations: [
      {
        code: 'es',
        word: 'flor',
        romanization: 'flor',
        phonetic: 'FLOHR',
        article: 'la',
        example: 'La flor del jardín huele de maravilla.',
        exampleMeaning: 'The garden flower smells wonderful.',
      },
      {
        code: 'en',
        word: 'flower',
        romanization: 'flower',
        phonetic: 'FLOW-uhr',
        article: 'a',
        example: 'A bright flower bloomed after the rain.',
        exampleMeaning: 'A bright flower bloomed after the rain.',
      },
      {
        code: 'ja',
        word: '花',
        romanization: 'hana',
        phonetic: 'hah-nah',
        example: '庭にきれいな花が咲いています。',
        exampleMeaning: 'Pretty flowers are blooming in the garden.',
      },
      {
        code: 'hi',
        word: 'फूल',
        romanization: 'phūl',
        phonetic: 'FOOL',
        example: 'बगीचे में सुंदर फूल खिले हैं।',
        exampleMeaning: 'Beautiful flowers have bloomed in the garden.',
      },
      {
        code: 'zh',
        word: '花',
        romanization: 'huā',
        phonetic: 'hwah',
        article: '朵',
        example: '这朵花闻起来很香。',
        exampleMeaning: 'This flower smells very fragrant.',
      },
    ],
  },
  {
    id: 'bottle',
    object: 'bottle',
    emoji: '🍼',
    category: 'Object',
    aliases: ['bottle', 'bottles', 'water bottle', 'glass bottle', 'flask', 'thermos', 'botella'],
    quips: [
      'Hydration check passed! Your vocal cords are ready for the pronunciation test.',
      'Message in a bottle: “Keep your daily photo streak alive!”',
      'Clean silhouette on that bottle—my aperture eye approves.',
    ],
    translations: [
      {
        code: 'es',
        word: 'botella',
        romanization: 'botella',
        phonetic: 'boh-TEH-yah',
        article: 'la',
        example: 'Llevo siempre una botella de agua fresca.',
        exampleMeaning: 'I always carry a bottle of fresh water.',
      },
      {
        code: 'en',
        word: 'bottle',
        romanization: 'bottle',
        phonetic: 'BOT-uhl',
        article: 'a',
        example: 'Fill the reusable bottle before heading out.',
        exampleMeaning: 'Fill the reusable bottle before heading out.',
      },
      {
        code: 'ja',
        word: 'ボトル',
        romanization: 'botoru',
        phonetic: 'boh-toh-roo',
        example: '水筒のボトルに水を入れました。',
        exampleMeaning: 'I poured water into the bottle.',
      },
      {
        code: 'hi',
        word: 'बोतल',
        romanization: 'botal',
        phonetic: 'BOH-tuhl',
        example: 'बोतल में ठंडा पानी भरा है।',
        exampleMeaning: 'The bottle is filled with cold water.',
      },
      {
        code: 'zh',
        word: '瓶子',
        romanization: 'píngzi',
        phonetic: 'ping-dzuh',
        article: '个',
        example: '请把水倒进这个瓶子里。',
        exampleMeaning: 'Please pour water into this bottle.',
      },
    ],
  },
  {
    id: 'car',
    object: 'car',
    emoji: '🚗',
    category: 'Transport',
    aliases: ['car', 'cars', 'automobile', 'vehicle', 'sedan', 'suv', 'auto', 'coche'],
    quips: [
      'Zero to five languages in 2.4 seconds! Nice shot of that ride.',
      'Beep beep! Even parked, that car is taking your vocabulary places.',
      'If I drove a car, the rearview mirror would just be my second eye.',
    ],
    translations: [
      {
        code: 'es',
        word: 'coche',
        romanization: 'coche',
        phonetic: 'KOH-cheh',
        article: 'el',
        example: 'El coche eléctrico es muy silencioso.',
        exampleMeaning: 'The electric car is very quiet.',
      },
      {
        code: 'en',
        word: 'car',
        romanization: 'car',
        phonetic: 'KAHR',
        article: 'a',
        example: 'We parked the car near the station.',
        exampleMeaning: 'We parked the car near the station.',
      },
      {
        code: 'ja',
        word: '車',
        romanization: 'kuruma',
        phonetic: 'koo-roo-mah',
        example: '週末は車で海へ行きます。',
        exampleMeaning: 'On the weekend I go to the sea by car.',
      },
      {
        code: 'hi',
        word: 'गाड़ी',
        romanization: 'gāṛī',
        phonetic: 'gah-REE',
        example: 'हमारी गाड़ी बाहर खड़ी है।',
        exampleMeaning: 'Our car is parked outside.',
      },
      {
        code: 'zh',
        word: '汽车',
        romanization: 'qìchē',
        phonetic: 'chee-chuh',
        article: '辆',
        example: '那辆汽车停在路边。',
        exampleMeaning: 'That car is parked by the roadside.',
      },
    ],
  },
  {
    id: 'water',
    object: 'water',
    emoji: '💧',
    category: 'Drink',
    aliases: ['water', 'glass of water', 'drinking water', 'h2o', 'liquid', 'agua'],
    quips: [
      'Pure H₂O! Arguably the most useful word you can order in any country on Earth.',
      'Crystal clear shot. Stay hydrated, stay polyglot.',
      'Fun fact: saying “water” in five languages is 100% calorie-free.',
    ],
    translations: [
      {
        code: 'es',
        word: 'agua',
        romanization: 'agua',
        phonetic: 'AH-gwah',
        article: 'el',
        example: 'Bebo ocho vasos de agua al día.',
        exampleMeaning: 'I drink eight glasses of water a day.',
      },
      {
        code: 'en',
        word: 'water',
        romanization: 'water',
        phonetic: 'WAW-tuhr',
        article: 'the',
        example: 'Could I have a glass of cold water, please?',
        exampleMeaning: 'Could I have a glass of cold water, please?',
      },
      {
        code: 'ja',
        word: '水',
        romanization: 'mizu',
        phonetic: 'mee-zoo',
        example: '冷たいお水をください。',
        exampleMeaning: 'Cold water, please.',
      },
      {
        code: 'hi',
        word: 'पानी',
        romanization: 'pānī',
        phonetic: 'pah-NEE',
        example: 'मुझे एक गिलास पानी चाहिए।',
        exampleMeaning: 'I would like a glass of water.',
      },
      {
        code: 'zh',
        word: '水',
        romanization: 'shuǐ',
        phonetic: 'shway',
        article: '杯',
        example: '每天多喝水对身体好。',
        exampleMeaning: 'Drinking more water every day is good for your health.',
      },
    ],
  },
  {
    id: 'window',
    object: 'window',
    emoji: '🪟',
    category: 'Object',
    aliases: ['window', 'windows', 'glass window', 'windowpane', 'balcony window', 'ventana'],
    quips: [
      'A window! Great natural lighting—photographers and chameleons both love a sunny sill.',
      'Looking out the window and dreaming in five languages. Poetic, really.',
      'Clean glass! Not even a smudge to confuse my vision model.',
    ],
    translations: [
      {
        code: 'es',
        word: 'ventana',
        romanization: 'ventana',
        phonetic: 'behn-TAH-nah',
        article: 'la',
        example: 'Abre la ventana para que entre aire fresco.',
        exampleMeaning: 'Open the window to let fresh air in.',
      },
      {
        code: 'en',
        word: 'window',
        romanization: 'window',
        phonetic: 'WIN-doh',
        article: 'a',
        example: 'Sunlight streamed through the bedroom window.',
        exampleMeaning: 'Sunlight streamed through the bedroom window.',
      },
      {
        code: 'ja',
        word: '窓',
        romanization: 'mado',
        phonetic: 'mah-doh',
        example: '窓を開けると気持ちがいい風が吹きます。',
        exampleMeaning: 'When I open the window, a pleasant breeze blows in.',
      },
      {
        code: 'hi',
        word: 'खिड़की',
        romanization: 'khiṛkī',
        phonetic: 'khir-KEE',
        example: 'ताज़ी हवा के लिए खिड़की खोल दो।',
        exampleMeaning: 'Open the window for fresh air.',
      },
      {
        code: 'zh',
        word: '窗户',
        romanization: 'chuānghu',
        phonetic: 'chwahng-hoo',
        article: '扇',
        example: '请打开窗户通通风。',
        exampleMeaning: 'Please open the window for ventilation.',
      },
    ],
  },
  {
    id: 'glasses',
    object: 'glasses',
    emoji: '👓',
    category: 'Clothing',
    aliases: ['glasses', 'eyeglasses', 'spectacles', 'sunglasses', 'frames', 'gafas', 'lentes'],
    quips: [
      'Glasses! Two lenses for you, one giant builtin telephoto eye for me.',
      'Sharp specs! Instant +10 intelligence stat before you even say a word.',
      'Now we both have precision optics. Let’s read those kanji together.',
    ],
    translations: [
      {
        code: 'es',
        word: 'gafas',
        romanization: 'gafas',
        phonetic: 'GAH-fahs',
        article: 'las',
        example: 'Necesito mis gafas para leer de cerca.',
        exampleMeaning: 'I need my glasses to read up close.',
      },
      {
        code: 'en',
        word: 'glasses',
        romanization: 'glasses',
        phonetic: 'GLAS-iz',
        article: 'the',
        example: 'He wiped his glasses with a soft cloth.',
        exampleMeaning: 'He wiped his glasses with a soft cloth.',
      },
      {
        code: 'ja',
        word: '眼鏡',
        romanization: 'megane',
        phonetic: 'meh-gah-neh',
        example: '本を読むときは眼鏡をかけます。',
        exampleMeaning: 'I put on glasses when reading a book.',
      },
      {
        code: 'hi',
        word: 'चश्मा',
        romanization: 'chashmā',
        phonetic: 'chush-MAH',
        example: 'मेरा नया चश्मा बहुत हल्का है।',
        exampleMeaning: 'My new glasses are very light.',
      },
      {
        code: 'zh',
        word: '眼镜',
        romanization: 'yǎnjìng',
        phonetic: 'yen-jing',
        article: '副',
        example: '他戴着一副黑框眼镜。',
        exampleMeaning: 'He is wearing a pair of black-framed glasses.',
      },
    ],
  },
  {
    id: 'pen',
    object: 'pen',
    emoji: '🖊️',
    category: 'Object',
    aliases: ['pen', 'pens', 'ballpoint pen', 'fountain pen', 'pencil', 'marker', 'stylus', 'bolígrafo'],
    quips: [
      'The pen is mightier than the sword—especially when it writes in three alphabets.',
      'A classic pen! Ready to sign autographs once you hit the Legend rank.',
      'Sleek, pointy, reliable. Every polyglot’s trusty sidekick.',
    ],
    translations: [
      {
        code: 'es',
        word: 'bolígrafo',
        romanization: 'bolígrafo',
        phonetic: 'boh-LEE-grah-foh',
        article: 'el',
        example: 'Firmé el documento con un bolígrafo azul.',
        exampleMeaning: 'I signed the document with a blue pen.',
      },
      {
        code: 'en',
        word: 'pen',
        romanization: 'pen',
        phonetic: 'PEN',
        article: 'a',
        example: 'Can I borrow a pen to write this down?',
        exampleMeaning: 'Can I borrow a pen to write this down?',
      },
      {
        code: 'ja',
        word: 'ペン',
        romanization: 'pen',
        phonetic: 'pehn',
        example: '黒いペンで名前を書いてください。',
        exampleMeaning: 'Please write your name with a black pen.',
      },
      {
        code: 'hi',
        word: 'कलम',
        romanization: 'kalam',
        phonetic: 'kuh-LUM',
        example: 'मैंने इस कलम से एक पत्र लिखा।',
        exampleMeaning: 'I wrote a letter with this pen.',
      },
      {
        code: 'zh',
        word: '笔',
        romanization: 'bǐ',
        phonetic: 'bee',
        article: '支',
        example: '请借我一支笔写字。',
        exampleMeaning: 'Please lend me a pen to write.',
      },
    ],
  },
  {
    id: 'backpack',
    object: 'backpack',
    emoji: '🎒',
    category: 'Clothing',
    aliases: ['backpack', 'bag', 'rucksack', 'schoolbag', 'handbag', 'tote bag', 'mochila'],
    quips: [
      'A backpack! Plenty of room inside for snacks, chargers, and 500 flashcards.',
      'Adventure mode unlocked. Where are we taking this bag next—Tokyo or Madrid?',
      'Sturdy straps! Built to carry a multi-week photo streak without breaking a sweat.',
    ],
    translations: [
      {
        code: 'es',
        word: 'mochila',
        romanization: 'mochila',
        phonetic: 'moh-CHEE-lah',
        article: 'la',
        example: 'Metí el cuaderno y la cámara en la mochila.',
        exampleMeaning: 'I put the notebook and the camera in the backpack.',
      },
      {
        code: 'en',
        word: 'backpack',
        romanization: 'backpack',
        phonetic: 'BAK-pak',
        article: 'a',
        example: 'She packed a lightweight backpack for the trip.',
        exampleMeaning: 'She packed a lightweight backpack for the trip.',
      },
      {
        code: 'ja',
        word: 'リュック',
        romanization: 'ryukku',
        phonetic: 'ryook-koo',
        example: '旅行にはこのリュックが便利です。',
        exampleMeaning: 'This backpack is convenient for travel.',
      },
      {
        code: 'hi',
        word: 'बस्ता',
        romanization: 'bastā',
        phonetic: 'bus-TAH',
        example: 'मेरा बस्ता आज बहुत हल्का है।',
        exampleMeaning: 'My backpack is very light today.',
      },
      {
        code: 'zh',
        word: '背包',
        romanization: 'bēibāo',
        phonetic: 'bay-baow',
        article: '个',
        example: '我背着一个黑色的背包去旅行。',
        exampleMeaning: 'I am carrying a black backpack for the trip.',
      },
    ],
  },
  {
    id: 'headphones',
    object: 'headphones',
    emoji: '🎧',
    category: 'Tech',
    aliases: ['headphones', 'earphones', 'earbuds', 'headset', 'airpods', 'auriculares'],
    quips: [
      'Headphones! Perfect for looping native Japanese and Hindi pronunciation on repeat.',
      'Noise cancellation ON, polyglot focus mode ACTIVATED.',
      'If they made headphones for chameleons, I would wear them on my crest.',
    ],
    translations: [
      {
        code: 'es',
        word: 'auriculares',
        romanization: 'auriculares',
        phonetic: 'ow-ree-koo-LAH-rehs',
        article: 'los',
        example: 'Escucho la pronunciación con mis auriculares.',
        exampleMeaning: 'I listen to the pronunciation with my headphones.',
      },
      {
        code: 'en',
        word: 'headphones',
        romanization: 'headphones',
        phonetic: 'HED-fohnz',
        article: 'the',
        example: 'Put on your headphones to hear every syllable.',
        exampleMeaning: 'Put on your headphones to hear every syllable.',
      },
      {
        code: 'ja',
        word: 'ヘッドホン',
        romanization: 'heddohon',
        phonetic: 'hed-doh-hohn',
        example: '音楽を聴くときにヘッドホンを使います。',
        exampleMeaning: 'I use headphones when listening to music.',
      },
      {
        code: 'hi',
        word: 'हेडफ़ोन',
        romanization: 'heḍfon',
        phonetic: 'HED-fohn',
        example: 'सही उच्चारण सुनने के लिए हेडफ़ोन लगाएँ।',
        exampleMeaning: 'Put on headphones to hear the right pronunciation.',
      },
      {
        code: 'zh',
        word: '耳机',
        romanization: 'ěrjī',
        phonetic: 'uhr-jee',
        article: '副',
        example: '戴上耳机可以听得更清楚。',
        exampleMeaning: 'Wearing headphones lets you hear more clearly.',
      },
    ],
  },
  {
    id: 'bread',
    object: 'bread',
    emoji: '🍞',
    category: 'Food',
    aliases: ['bread', 'loaf', 'toast', 'baguette', 'croissant', 'sandwich', 'roll', 'pan'],
    quips: [
      'Fresh bread! Universally loved across every continent and every dictionary.',
      'Golden crust, top-tier framing. Now let’s get this bread in five languages.',
      'Even a digital chameleon can appreciate a warm loaf of carbs.',
    ],
    translations: [
      {
        code: 'es',
        word: 'pan',
        romanization: 'pan',
        phonetic: 'PAHN',
        article: 'el',
        example: 'Compré pan recién horneado en la esquina.',
        exampleMeaning: 'I bought freshly baked bread on the corner.',
      },
      {
        code: 'en',
        word: 'bread',
        romanization: 'bread',
        phonetic: 'BRED',
        article: 'the',
        example: 'The smell of warm bread filled the kitchen.',
        exampleMeaning: 'The smell of warm bread filled the kitchen.',
      },
      {
        code: 'ja',
        word: 'パン',
        romanization: 'pan',
        phonetic: 'pahn',
        example: '焼きたてのパンはとても美味しいです。',
        exampleMeaning: 'Freshly baked bread is delicious.',
      },
      {
        code: 'hi',
        word: 'रोटी',
        romanization: 'roṭī',
        phonetic: 'roh-TEE',
        example: 'गरम रोटी की खुशबू बहुत अच्छी है।',
        exampleMeaning: 'The aroma of warm bread is wonderful.',
      },
      {
        code: 'zh',
        word: '面包',
        romanization: 'miànbāo',
        phonetic: 'myen-baow',
        article: '块',
        example: '我早餐吃了一块烤面包。',
        exampleMeaning: 'I ate a piece of toast for breakfast.',
      },
    ],
  },
  {
    id: 'tree',
    object: 'tree',
    emoji: '🌳',
    category: 'Nature',
    aliases: ['tree', 'trees', 'oak', 'pine', 'palm tree', 'branch', 'leaves', 'forest', 'árbol'],
    quips: [
      'A tree! Now you are photographing my ancestral chameleon real estate.',
      'Five stars for that canopy—10/10 would camouflage on those branches.',
      'Your vocabulary is branching out nicely today. Yes, the pun was intentional.',
    ],
    translations: [
      {
        code: 'es',
        word: 'árbol',
        romanization: 'árbol',
        phonetic: 'AHR-bohl',
        article: 'el',
        example: 'El árbol da una sombra fresca en verano.',
        exampleMeaning: 'The tree gives cool shade in summer.',
      },
      {
        code: 'en',
        word: 'tree',
        romanization: 'tree',
        phonetic: 'TREE',
        article: 'a',
        example: 'A tall green tree stands in the courtyard.',
        exampleMeaning: 'A tall green tree stands in the courtyard.',
      },
      {
        code: 'ja',
        word: '木',
        romanization: 'ki',
        phonetic: 'kee',
        example: '公園に大きな木があります。',
        exampleMeaning: 'There is a big tree in the park.',
      },
      {
        code: 'hi',
        word: 'पेड़',
        romanization: 'peṛ',
        phonetic: 'PAIR',
        example: 'यह हरा पेड़ बहुत छाया देता है।',
        exampleMeaning: 'This green tree gives plenty of shade.',
      },
      {
        code: 'zh',
        word: '树',
        romanization: 'shù',
        phonetic: 'shoo',
        article: '棵',
        example: '院子里有一棵高大的树。',
        exampleMeaning: 'There is a tall tree in the courtyard.',
      },
    ],
  },
];

/** Deterministic Word of the Day based on the local calendar date. */
export function getDailyWord(date = new Date()): CatalogEntry {
  const daysSinceEpoch = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return CATALOG[Math.abs(daysSinceEpoch) % CATALOG.length];
}

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Finds a catalog entry by English/Spanish name or alias. */
export function findCatalogEntry(query: string): CatalogEntry | undefined {
  const norm = normalizeToken(query);
  if (!norm) return undefined;
  const singular = norm.endsWith('s') && norm.length > 3 ? norm.slice(0, -1) : norm;

  return CATALOG.find((entry) => {
    if (normalizeToken(entry.object) === norm || normalizeToken(entry.object) === singular) {
      return true;
    }
    if (entry.aliases.some((alias) => {
      const a = normalizeToken(alias);
      return a === norm || a === singular || norm.includes(a) || a.includes(norm);
    })) {
      return true;
    }
    return entry.translations.some((t) => normalizeToken(t.word) === norm);
  });
}

/** Checks if a detected object name matches today's Word of the Day. */
export function evaluateDailyMatch(
  detectedObject: string,
  daily: CatalogEntry = getDailyWord(),
  aiMatched?: boolean,
  aiReason?: string,
): DailyMatch {
  const normDetected = normalizeToken(detectedObject);
  const catalogHit =
    normDetected === normalizeToken(daily.object) ||
    daily.aliases.some((alias) => {
      const a = normalizeToken(alias);
      return a === normDetected || (normDetected.length >= 3 && (normDetected.includes(a) || a.includes(normDetected)));
    }) ||
    daily.translations.some((t) => normalizeToken(t.word) === normDetected);

  if (catalogHit) {
    return {
      matched: true,
      reason: `Bullseye! You captured today's Word of the Day (${daily.emoji} ${daily.object}) and unlocked a Daily Photo Crown!`,
      judgedBy: 'catalog',
    };
  }

  if (aiMatched) {
    return {
      matched: true,
      reason:
        aiReason?.trim() ||
        `Creative match! Your photo connects with today's Word of the Day (${daily.emoji} ${daily.object}).`,
      judgedBy: 'ai',
    };
  }

  return {
    matched: false,
    reason: `Great discovery! Today's Word of the Day is ${daily.emoji} ${daily.object}—snap it anytime to claim today's Crown.`,
    judgedBy: 'none',
  };
}

/** Filters and orders an entry's translations according to the user's selected languages. */
export function catalogTranslations(
  entry: CatalogEntry,
  langs: readonly LangCode[] = ALL_LANGS,
): Translation[] {
  const active = langs.length > 0 ? langs : ALL_LANGS;
  const picked = active
    .map((code) => entry.translations.find((item) => item.code === code))
    .filter((item): item is Translation => Boolean(item));
  return picked.length > 0 ? picked : entry.translations;
}

/** Builds a complete ScanResult from the local catalog. */
export function demoResult(
  langs: readonly LangCode[] = ALL_LANGS,
  preferredObject?: string,
): ScanResult {
  const daily = getDailyWord();
  const entry =
    (preferredObject ? findCatalogEntry(preferredObject) : undefined) ??
    CATALOG[Math.floor(Math.random() * CATALOG.length)];
  const quip = entry.quips[Math.floor(Math.random() * entry.quips.length)];

  return {
    object: entry.object,
    emoji: entry.emoji,
    category: entry.category,
    confidence: Number((0.91 + Math.random() * 0.07).toFixed(2)),
    translations: catalogTranslations(entry, langs),
    source: 'demo',
    kamuQuip: quip,
    dailyMatch: evaluateDailyMatch(entry.object, daily),
  };
}

export function translationFor(object: string, code: LangCode): Translation | undefined {
  const entry = findCatalogEntry(object);
  return entry?.translations.find((item) => item.code === code);
}

export function catalogEmoji(object: string): string {
  return findCatalogEntry(object)?.emoji ?? '✨';
}

export function languageLabel(code: LangCode): string {
  return LANG_BY_CODE[code]?.name ?? code.toUpperCase();
}
