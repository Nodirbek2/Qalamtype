import { AcademyTier, Language } from '../types';
import uzLiterature from './uz_literature.json';
import uzEasy from './uz_easy.json';
import uzMedium from './uz_medium.json';
import uzHard from './uz_hard.json';
import cyEasy from './uz_cyrillic_easy.json';
import cyMedium from './uz_cyrillic_medium.json';
import cyHard from './uz_cyrillic_hard.json';
import ruEasy from './ru_easy.json';
import ruMedium from './ru_medium.json';
import ruHard from './ru_hard.json';
import enEasy from './en_easy.json';
import enMedium from './en_medium.json';
import enHard from './en_hard.json';


const LEGACY_TIERS: AcademyTier[] = [
  // TIER 1: Harflar (Letters)
  {
    id: 'tier_1',
    number: 1,
    name: {
      uzbek_latin: 'Harflar',
      uzbek_cyrillic: 'Ҳарфлар',
      russian: 'Буквы',
      english: 'Letters',
    },
    description: {
      uzbek_latin: 'Klaviatura tugmalarini barmoqlar xotirasiga kiritish va asosiy qatorlar mashqlari',
      uzbek_cyrillic: 'Клавиатура тугмаларини бармоқлар хотирасига киритиш ва асосий қаторлар машқлари',
      russian: 'Упражнения для базовых рядов и постановки пальцев на клавиатуре',
      english: 'Finger positioning and base row muscle memory exercises',
    },
    lessons: [
      {
        id: 't1_l1',
        tierNumber: 1,
        lessonNumber: 1,
        title: {
          uzbek_latin: '1-dars: Asosiy qator (Home Row)',
          uzbek_cyrillic: '1-дарс: Асосий қатор (Home Row)',
          russian: 'Урок 1: Основной ряд (Home Row)',
          english: 'Lesson 1: Home Row',
        },
        content: {
          uzbek_latin: 'asdf jkl; asdf jkl; fdsA jkl; asdf jkl; fdfd jkjk asdf jkl; fdsA jkl; fdfd jkjk asdf jkl; fdsA jkl; fdfd jkjk asdf jkl; fdsA jkl;',
          uzbek_cyrillic: 'фыва олдж фыва олдж авыф олдж фыва олдж апап олол фыва олдж авыф олдж апап олол фыва олдж авыф олдж апап олол фыва олдж',
          russian: 'фыва олдж фыва олдж авыф олдж фыва олдж апап олол фыва олдж авыф олдж апап олол фыва олдж авыф олдж апап олол фыва олдж',
          english: 'asdf jkl; asdf jkl; fdsa jkl; asdf jkl; fdfd jkjk asdf jkl; fdsa jkl; fdfd jkjk asdf jkl; fdsa jkl; fdfd jkjk asdf jkl; fdsa jkl;',
        },
      },
      {
        id: 't1_l2',
        tierNumber: 1,
        lessonNumber: 2,
        title: {
          uzbek_latin: '2-dars: Yuqori qator (Top Row)',
          uzbek_cyrillic: '2-дарс: Юқори қатор (Top Row)',
          russian: 'Урок 2: Верхний ряд (Top Row)',
          english: 'Lesson 2: Top Row',
        },
        content: {
          uzbek_latin: 'qwer poiu qwer poiu erui wrot qwer poiu reew oopp qwer poiu erui wrot qwer poiu reew oopp qwer poiu erui wrot qwer poiu reew oopp',
          uzbek_cyrillic: 'йцук гшщз йцук гшщз укнг шщзг йцук гшщз ккей зщщш йцук гшщз укнг шщзг йцук гшщз ккей зщщш йцук гшщз укнг шщзг йцук гшщз',
          russian: 'йцук гшщз йцук гшщз укнг шщзг йцук гшщз ккей зщщш йцук гшщз укнг шщзг йцук гшщз ккей зщщш йцук гшщз укнг шщзг йцук гшщз',
          english: 'qwer poiu qwer poiu erui wrot qwer poiu reew oopp qwer poiu erui wrot qwer poiu reew oopp qwer poiu erui wrot qwer poiu reew oopp',
        },
      },
      {
        id: 't1_l3',
        tierNumber: 1,
        lessonNumber: 3,
        title: {
          uzbek_latin: '3-dars: Quyi qator (Bottom Row)',
          uzbek_cyrillic: '3-дарс: Қуйи қатор (Bottom Row)',
          russian: 'Урок 3: Нижний ряд (Bottom Row)',
          english: 'Lesson 3: Bottom Row',
        },
        content: {
          uzbek_latin: 'zxcv mnbv zxcv mnbv cxmv xzbn zxcv mnbv vcxz vbnm zxcv mnbv cxmv xzbn zxcv mnbv vcxz vbnm zxcv mnbv cxmv xzbn zxcv mnbv vcxz vbnm',
          uzbek_cyrillic: 'ячсми тьбю ячсми тьбю чсми мсить ячсми тьбю мися мсит ячсми тьбю чсми мсить ячсми тьбю мися мсит ячсми тьбю чсми мсить ячсми',
          russian: 'ячсми тьбю ячсми тьбю чсми мсить ячсми тьбю мися мсит ячсми тьбю чсми мсить ячсми тьбю мися мсит ячсми тьбю чсми мсить ячсми',
          english: 'zxcv mnbv zxcv mnbv cxmv xzbn zxcv mnbv vcxz vbnm zxcv mnbv cxmv xzbn zxcv mnbv vcxz vbnm zxcv mnbv cxmv xzbn zxcv mnbv vcxz vbnm',
        },
      },
      {
        id: 't1_l4',
        tierNumber: 1,
        lessonNumber: 4,
        title: {
          uzbek_latin: '4-dars: Aralash harflar (Mixed Combination)',
          uzbek_cyrillic: '4-дарс: Аралаш ҳарфлар (Mixed Combination)',
          russian: 'Урок 4: Смешанный ряд (Mixed Combination)',
          english: 'Lesson 4: Mixed Combination',
        },
        content: {
          uzbek_latin: 'asdf qwer zxcv jkl; poiu mnbv erxz uikm asdf qwer zxcv jkl; poiu mnbv erxz uikm asdf qwer zxcv jkl; poiu mnbv erxz uikm asdf qwer zxcv',
          uzbek_cyrillic: 'фыва йцук ячсм олдж гшщз тьбю укам гшми фыва йцук ячсм олдж гшщз тьбю укам гшми фыва йцук ячсм олдж гшщз тьбю укам гшми фыва йцук',
          russian: 'фыва йцук ячсм олдж гшщз тьбю укам гшми фыва йцук ячсм олдж гшщз тьбю укам гшми фыва йцук ячсм олдж гшщз тьбю укам гшми фыва йцук',
          english: 'asdf qwer zxcv jkl; poiu mnbv erxz uikm asdf qwer zxcv jkl; poiu mnbv erxz uikm asdf qwer zxcv jkl; poiu mnbv erxz uikm asdf qwer zxcv',
        },
      },
    ],
  },

  // TIER 2: Oson so'zlar (Easy words)
  {
    id: 'tier_2',
    number: 2,
    name: {
      uzbek_latin: "Oson so'zlar",
      uzbek_cyrillic: 'Осон сўзлар',
      russian: 'Простые слова',
      english: 'Easy Words',
    },
    description: {
      uzbek_latin: "Kichik va tez-tez ishlatiladigan so'zlar bilan yozish sur'atini oshirish",
      uzbek_cyrillic: 'Кичик ва тез-тез ишлатиладиган сўзлар билан ёзиш суръатини ошириш',
      russian: 'Набор коротких и наиболее часто употребляемых слов',
      english: 'Practice typing short, high-frequency words effortlessly',
    },
    lessons: [
      {
        id: 't2_l1',
        tierNumber: 2,
        lessonNumber: 1,
        title: {
          uzbek_latin: '1-dars: Qisqa so\'zlar',
          uzbek_cyrillic: '1-дарс: Қисқа сўзлар',
          russian: 'Урок 1: Короткие слова',
          english: 'Lesson 1: Short Words',
        },
        content: {
          uzbek_latin: 'bilan ham shu va men sen u biz siz ular bola ona ota uy ish non suv un shahar qishloq kitob qalam dars maktab yo\'l yer osmon quyosh oydin kun tun',
          uzbek_cyrillic: 'билан ҳам шу ва мен сен у биз сиз улар бола она ота уй иш нон сув ун шаҳар қишлоқ китоб қалам дарс мактаб йўл ер осмон қуёш ойдин кун тун',
          russian: 'дом сад кот лес сон мир шаг день час брат сестра мать отец вода хлеб дело слово рука ночь свет море край друг окно земля сосна гора',
          english: 'cat dog sun sky blue Red tree book pen city home desk hand mind time word standard fast clear life year day light rain wind wind rock park',
        },
      },
      {
        id: 't2_l2',
        tierNumber: 2,
        lessonNumber: 2,
        title: {
          uzbek_latin: '2-dars: Kundalik lug\'at',
          uzbek_cyrillic: '2-дарс: Кундалик луғат',
          russian: 'Урок 2: Повседневная лексика',
          english: 'Lesson 2: Daily Vocabulary',
        },
        content: {
          uzbek_latin: 'katta kichik yaxshi yomon qizil yashil ko\'k sariq oq qora baland past issiq sovuq yangi eski oson qiyin toza iflos tez sekin kuchli',
          uzbek_cyrillic: 'катта кичик яхши ёмон қизил яшил кўк сариқ оқ қора баланд паст иссиқ совуқ янги эски осон қийин тоза ифлос тез секин кучли',
          russian: 'белый черный красный зеленый синий желтый большой маленький новый старый быстрый тихий теплый холодный чистый добрый умный сильный',
          english: 'small large happy quiet quick slow heavy light warm cold fresh clean green white black young sweet sharp standard smooth level deep high',
        },
      },
      {
        id: 't2_l3',
        tierNumber: 3,
        lessonNumber: 3,
        title: {
          uzbek_latin: '3-dars: Tabiat va Hayot',
          uzbek_cyrillic: '3-дарс: Табиат ва Ҳаёт',
          russian: 'Урок 3: Природа и жизнь',
          english: 'Lesson 3: Nature and Life',
        },
        content: {
          uzbek_latin: 'daryo tog\' dasht bog\' g\'uncha gul daraxt barg shamol yomg\'ir qor havo zamin tabiat hayot umr baxt sevinch do\'st orzu umid kelajak',
          uzbek_cyrillic: 'дарё тоғ дашт боғ ғунча гул дарахт барг шамол ёмғир қор ҳаво замин табиат ҳаёт умр бахт севинч дўст орзу умид келажак',
          russian: 'река гора поле сад цвет дерево лист ветер дождь снег воздух земля природа жизнь счастье радость друг мечта надежда время будущее',
          english: 'river hill garden flower tree leaf wind rain snow fresh earth nature life dream hope future friend joy peace bright shadow spirit soul',
        },
      },
    ],
  },

  // TIER 3: O'rta so'zlar / jumlalar
  {
    id: 'tier_3',
    number: 3,
    name: {
      uzbek_latin: "O'rta jumlalar",
      uzbek_cyrillic: 'Ўрта жумлалар',
      russian: 'Средние предложения',
      english: 'Medium Sentences',
    },
    description: {
      uzbek_latin: "Tabiiy matnlar va sodda gaplar ustida barqaror tezlikni shakllantirish",
      uzbek_cyrillic: 'Табиий матнлар ва содда гаплар устида барқарор тезликни шакллантириш',
      russian: 'Развитие ритма и скорости на простых законченных предложениях',
      english: 'Build typing rhythm on short natural sentences and meaningful phrases',
    },
    lessons: [
      {
        id: 't3_l1',
        tierNumber: 3,
        lessonNumber: 1,
        title: {
          uzbek_latin: '1-dars: Tabiat haqida jumlalar',
          uzbek_cyrillic: '1-дарс: Табиат ҳақида жумлалар',
          russian: 'Урок 1: Предложения о природе',
          english: 'Lesson 1: Nature Sentences',
        },
        content: {
          uzbek_latin: 'Bahor faslida barcha daraxtlar g\'uncha tugib gullaydi. Quyosh charqlab atrofga issiqlik ulashadi. Yoz oylarida tog\' bag\'rida havo juda musaffo bo\'ladi. Yomg\'irdan so\'ng yer yuzi yangilanadi.',
          uzbek_cyrillic: 'Баҳор фаслида барча дарахтлар ғунча тугиб гуллайди. Қуёш чарқлаб атрофга иссиқлик улашади. Ёз ойларида тоғ бағрида ҳаво жуда мусаффо бўлади. Ёмғирдан сўнг ер юзи янгиланади.',
          russian: 'Весной все деревья покрываются быстрыми молодыми листьями. Солнце светит ярко и дарит тепло всему живому. Летом в горах воздух всегда чистый и свежий. После теплого дождя земля обновляется.',
          english: 'In spring all the trees begin to blossom with fresh green leaves. The sun shines brightly and brings warmth to nature. Mountain air is always pure and refreshing in summer. Clear rainwater gives new life.',
        },
      },
      {
        id: 't3_l2',
        tierNumber: 3,
        lessonNumber: 2,
        title: {
          uzbek_latin: '2-dars: Mehnat va bilim',
          uzbek_cyrillic: '2-дарс: Меҳнат ва билим',
          russian: 'Урок 2: Труд и знания',
          english: 'Lesson 2: Work and Wisdom',
        },
        content: {
          uzbek_latin: 'Bilim olish insonni doimo yuksaklikka chorlaydi. Mehnat qilgan kishi hech qachon kam bo\'lmaydi. Har bir dars yangi bilim va tajriba manbaidir. Do\'stlik va ahillik muvaffaqiyat kalitidir.',
          uzbek_cyrillic: 'Билим олиш инсонни доимо юксакликка чорлайди. Меҳнат қилган киши ҳеч қачон кам бўлмайди. Ҳар бир дарс янги билим ва тажриба манбаидир. Дўстлик ва аҳиллик муваффақият калитидир.',
          russian: 'Изучение нового всегда ведет человека к высоким достижениям. Труд приносит глубокую радость и уверенность в будущем. Каждый урок открывает интересные возможности. Дружба помогает преодолевать любые трудности.',
          english: 'Gaining knowledge leads every person toward great achievements. Honest work brings satisfaction and confidence. Every single practice session unlocks new skills. Unity and friendship overcome every obstacle.',
        },
      },
    ],
  },

  // TIER 4: Tinish belgilari
  {
    id: 'tier_4',
    number: 4,
    name: {
      uzbek_latin: 'Tinish belgilari',
      uzbek_cyrillic: 'Тиниш белгилари',
      russian: 'Знаки препинания',
      english: 'Punctuation Marks',
    },
    description: {
      uzbek_latin: "Vergul, nuqta, so'roq va undov belgilari, tirnoqlar va tire ustida mashq",
      uzbek_cyrillic: 'Вергул, нуқта, сўроқ ва ундов белгилари, тирноқлар ва тире устида машқ',
      russian: 'Тренировка использования запятых, точек, вопросительных и восклицательных знаков',
      english: 'Master commas, periods, question marks, quotes, and hyphens without slowing down',
    },
    lessons: [
      {
        id: 't4_l1',
        tierNumber: 4,
        lessonNumber: 1,
        title: {
          uzbek_latin: '1-dars: Vergul va nuqtalar',
          uzbek_cyrillic: '1-дарс: Вергул ва нуқталар',
          russian: 'Урок 1: Запятые и точки',
          english: 'Lesson 1: Commas and Periods',
        },
        content: {
          uzbek_latin: 'Bugun ob-havo juda ochiq, lekin birdan shamol esishi mumkin. Qiziq, u kecha darsga keldimi? Ha, albatta, u barcha topshiriqlarni bajardi! "G\'alaba bizniki," dedi ustoz ishonch bilan.',
          uzbek_cyrillic: 'Бугун об-ҳаво жуда очиқ, лекин бирдан шамол эсиши мумкин. Қизиқ, у кеча дарсга келдими? Ҳа, албатта, у барча топшириқларни бажарди! "Ғалаба бизники," деди устоз ишонч билан.',
          russian: 'Сегодня погода прекрасная, однако к вечеру может подняться ветер. Интересно, он пришел вчера на занятие? Да, конечно, все задания выполнены правильно! "Победа за нами," — сказал учитель.',
          english: 'Today the weather is fine, but a sudden wind might start later. I wonder, did he arrive on time yesterday? Yes, of course, every assignment was completed! "Success is ours," said the mentor.',
        },
      },
      {
        id: 't4_l2',
        tierNumber: 4,
        lessonNumber: 2,
        title: {
          uzbek_latin: '2-dars: Tirnoqlar va tire',
          uzbek_cyrillic: '2-дарс: Тирноқлар ва тире',
          russian: 'Урок 2: Кавычки и тире',
          english: 'Lesson 2: Quotes and Dashes',
        },
        content: {
          uzbek_latin: 'Alisher Navoiy — buyuk o\'zbek shoiri va mutafakkiridir. U o\'zining "Xamsa" asari bilan dunyoga tanilgan. "Kutubxona — ma\'rifat maskani," deydi adiblar. Rostdan ham, kitob o\'qish insonga ma\'naviy oziq beradi!',
          uzbek_cyrillic: 'Алишер Навоий — буюк ўзбек шоири ва мутафаккиридир. У ўзининг "Хамса" асари билан дунёга танилган. "Кутубхона — маърифат маскани," дейди адиблар. Ростдан ҳам, китоб ўқиш инсонга маънавий озиқ беради!',
          russian: 'Алишер Навои — великий узбекский поэт и мыслитель. Его фундаментальный труд "Хамса" известен во всем мире. "Библиотека — храм знаний," — говорят ученые. Действительно, чтение книг обогащает разум!',
          english: 'Alisher Navoiy — the legendary Uzbek poet and philosopher. His masterpieces, including "Khamsa", are famous globally. "The library — a sanctuary of light," scholars say. Reading enriches human thought!',
        },
      },
    ],
  },

  // TIER 5: Raqamlar
  {
    id: 'tier_5',
    number: 5,
    name: {
      uzbek_latin: 'Raqamlar',
      uzbek_cyrillic: 'Рақамлар',
      russian: 'Цифры и числа',
      english: 'Numbers and Statistics',
    },
    description: {
      uzbek_latin: "Sanalar, narxlar, hisob-kitoblar va sonlarni matn ichida tezkor yozish",
      uzbek_cyrillic: 'Саналар, нархлар, ҳисоб-китоблар ва сонларни матн ичида тезкор ёзиш',
      russian: 'Быстрый ввод дат, цен, количественных показателей и числительных',
      english: 'Practice typing numbers, dates, values, and measurements seamlessly within text',
    },
    lessons: [
      {
        id: 't5_l1',
        tierNumber: 5,
        lessonNumber: 1,
        title: {
          uzbek_latin: '1-dars: Sanalar va vaqt',
          uzbek_cyrillic: '1-дарс: Саналар ва вақт',
          russian: 'Урок 1: Даты и время',
          english: 'Lesson 1: Dates and Time',
        },
        content: {
          uzbek_latin: 'Toshkent shahrida 1991-yil 31-avgust kuni O\'zbekiston Mustaqilligi e\'lon qilindi. Mashg\'ulot soat 09:30 da boshlanadi va 12:45 gacha davom etadi. 2026-yilda jami 365 kun bor.',
          uzbek_cyrillic: 'Тошкент шаҳрида 1991-йил 31-август куни Ўзбекистон Мустақиллиги эълон қилинди. Машғулот соат 09:30 да бошланади ва 12:45 гача давом этади. 2026-йилда жами 365 кун бор.',
          russian: 'В 1991 году 31 августа была провозглашена независимость Узбекистана. Занятие начинается ровно в 09:30 и продолжается до 12:45. В 2026 году календарь содержит 365 дней.',
          english: 'On August 31, 1991, independence was officially declared in Tashkent. The training session starts at 09:30 AM and runs until 12:45 PM. The calendar year 2026 contains exactly 365 days.',
        },
      },
      {
        id: 't5_l2',
        tierNumber: 5,
        lessonNumber: 2,
        title: {
          uzbek_latin: '2-dars: Narxlar va hisoblar',
          uzbek_cyrillic: '2-дарс: Нархлар ва ҳисоблар',
          russian: 'Урок 2: Цены и расчеты',
          english: 'Lesson 2: Prices and Measurements',
        },
        content: {
          uzbek_latin: 'Do\'kondan 2 kg olma 15000 so\'mga va 3 litr sut 24000 so\'mga xarid qilindi. Jami xarajat 39000 so\'mni tashkil etdi. Chegirma 10% bo\'lgani uchun xaridor 35100 so\'m to\'ladi.',
          uzbek_cyrillic: 'Дўкондан 2 кг олма 15000 сўмга ва 3 литр сут 24000 сўмга харид қилинди. Жами харажат 39000 сўмни ташкил этди. Чегирма 10% бўлгани учун харидор 35100 сўм тўлади.',
          russian: 'В магазине купили 2 кг яблок за 15000 сумов и 3 литра молока за 24000 сумов. Итоговая сумма составила 39000 сумов. С учетом скидки 10% к оплате вышло 35100 сумов.',
          english: 'Store receipt: 2 kg apples for 15000 UZS and 3 liters milk for 24000 UZS. Total cost reached 39000 UZS. Applying a 10% discount reduced the final payment to 35100 UZS.',
        },
      },
    ],
  },

  // TIER 6: Maxsus belgilar
  {
    id: 'tier_6',
    number: 6,
    name: {
      uzbek_latin: 'Maxsus belgilar',
      uzbek_cyrillic: 'Махсус белгилар',
      russian: 'Спецсимволы',
      english: 'Special Characters',
    },
    description: {
      uzbek_latin: "Dasturlash va kodlashda ishlatiladigan belgilar: @, #, $, %, &, *, (), = va boshqalar",
      uzbek_cyrillic: 'Дастурлаш ва кодлашда ишлатиладиган белгилар: @, #, $, %, &, *, (), = ва бошқалар',
      russian: 'Символы для программирования и документации: @, #, $, %, &, *, (), = и другие',
      english: 'Master programming and formula symbols: @, #, $, %, &, *, (), =, and brackets',
    },
    lessons: [
      {
        id: 't6_l1',
        tierNumber: 6,
        lessonNumber: 1,
        title: {
          uzbek_latin: '1-dars: Elektron manzil va teglari',
          uzbek_cyrillic: '1-дарс: Электрон манзил ва теглари',
          russian: 'Урок 1: Email и хештеги',
          english: 'Lesson 1: Email and Hashtags',
        },
        content: {
          uzbek_latin: 'Murojaat uchun email: info@qalampir.uz yoki support#102@google.com. Ijtimoiy tarmoqda #uzbekistan, #typing & #speed teglari ishlatiladi. Foyda darajasi 100% ga yetdi!',
          uzbek_cyrillic: 'Мурожаат учун email: info@qalampir.uz ёки support#102@google.com. Ижтимоий тармоқда #uzbekistan, #typing & #speed теглари ишлатилади. Фойда даражаси 100% га етди!',
          russian: 'Контактный email: info@qalampir.uz или support#102@google.com. В соцсетях используйте #typing, #speed & #code. Эффективность обучения составила 100%!',
          english: 'Contact email: info@qalampir.uz or support#102@google.com. On social channels use #typing, #speed & #code. Performance metrics reached 100% efficiency!',
        },
      },
      {
        id: 't6_l2',
        tierNumber: 6,
        lessonNumber: 2,
        title: {
          uzbek_latin: '2-dars: Matematika va Kod',
          uzbek_cyrillic: '2-дарс: Математика ва Код',
          russian: 'Урок 2: Математика и код',
          english: 'Lesson 2: Math & Code Symbols',
        },
        content: {
          uzbek_latin: 'Formulasi: x = (a + b) * [c - d] / 2; Agarda (val == 100) bo\'lsa { print("OK!"); } aks holda { count++; } Tizim bahosi: A+ (100% * 5/5) bo\'ldi.',
          uzbek_cyrillic: 'Формуласи: x = (a + b) * [c - d] / 2; Агарда (val == 100) бўлса { print("OK!"); } акс ҳолда { count++; } Тизим баҳоси: A+ (100% * 5/5) бўлди.',
          russian: 'Формула: x = (a + b) * [c - d] / 2; Если (val == 100) { print("OK!"); } иначе { count++; } Рейтинг системы: A+ (100% * 5/5) успешно получен.',
          english: 'Formula: x = (a + b) * [c - d] / 2; If (val == 100) { print("OK!"); } else { count++; } System score: A+ (100% * 5/5) achieved successfully.',
        },
      },
    ],
  },

  // TIER 7: Qiyin matnlar
  {
    id: 'tier_7',
    number: 7,
    name: {
      uzbek_latin: 'Qiyin matnlar',
      uzbek_cyrillic: 'Қийин матнлар',
      russian: 'Сложные тексты',
      english: 'Hard Complex Texts',
    },
    description: {
      uzbek_latin: "Uzun, murakkab so'z birikmalari va ilmiy-publitsistik matnlar",
      uzbek_cyrillic: 'Узун, мураккаб сўз бирикмалари ва илмий-публицистик матнлар',
      russian: 'Длинные предложения с комплексной пунктуацией и терминами',
      english: 'Longer, highly articulated texts requiring total concentration and pacing',
    },
    lessons: [
      {
        id: 't7_l1',
        tierNumber: 7,
        lessonNumber: 1,
        title: {
          uzbek_latin: '1-dars: Axborot texnologiyalari',
          uzbek_cyrillic: '1-дарс: Ахборот технологиялари',
          russian: 'Урок 1: Информационные технологии',
          english: 'Lesson 1: Information Technology',
        },
        content: {
          uzbek_latin: 'Zamonaviy axborot texnologiyalari insoniyat hayotini tubdan o\'zgartirib yubordi. Sun\'iy intellekt, neyron tarmoqlari va bulutli hisoblash tizimlari barcha sohalarga jadallik bilan kirib kelmoqda. Yuqori tezlikda aniq yozish ko\'nikmasi esa har bir mutaxassis uchun muhim ustunlikdir.',
          uzbek_cyrillic: 'Замонавий ахборот технологиялари инсоният ҳаётини тубдан ўзгартириб юборди. Сунъий интеллект, нейрон тармоқлари ва булутли ҳисоблаш тизимлари барча соҳаларга жадаллик билан кириб келмоқда. Юқори тезликда аниқ ёзиш кўникмаси эса ҳар бир мутахассис учун муҳим устунликдир.',
          russian: 'Современные информационные технологии фундаментально изменили жизнь общества. Искусственный интеллект, нейронные сети и облачные вычисления стремительно внедряются во все сферы деятельности. Навык быстрой и точной печати является ключевым преимуществом профессионала.',
          english: 'Modern information technology has fundamentally transformed human life globally. Artificial intelligence, neural networks, and cloud infrastructure are expanding rapidly across industries. High-speed accurate touch typing remains an indispensable core skill for professionals.',
        },
      },
    ],
  },

  // TIER 8: Adabiyot (Literature)
  {
    id: 'tier_8',
    number: 8,
    name: {
      uzbek_latin: 'Adabiyot',
      uzbek_cyrillic: 'Адабиёт',
      russian: 'Классическая литература',
      english: 'Classical Literature',
    },
    description: {
      uzbek_latin: "Klassik adabiyot durdonalari va mashhur romanlardan parchalar",
      uzbek_cyrillic: 'Классик адабиёт дурдоналари ва машҳур романлардан парчалар',
      russian: 'Отрывки из классических литературных произведений и шедевров',
      english: 'Excerpts from iconic literary classics and renowned masterpieces',
    },
    lessons: [
      {
        id: 't8_l1',
        tierNumber: 8,
        lessonNumber: 1,
        title: {
          uzbek_latin: '1-dars: O\'tkan kunlar (1-bob)',
          uzbek_cyrillic: '1-дарс: Ўткан кунлар (1-боб)',
          russian: 'Урок 1: Классический отрывок (Глава 1)',
          english: 'Lesson 1: Literary Classic (Chapter 1)',
        },
        content: {
          uzbek_latin: uzLiterature.entries[0].text,
          uzbek_cyrillic: '1264-инчи ҳижрий, далв ойининг ўн еттинчиси, қишки кунларнинг бири, қуёш ботқан, теваракдан шом азони эшитиладир. Дарбозаси шарқи-жанубийга қаратиб қурилған бу донгдор саройни Тошканд, Самарқанд ва Бухоро савдогарлари эгаллаганлар.',
          russian: 'В лесной глуши, среди высоких сосен и дубов, стоял старый уединенный дом. Вечерний свет медленно угасал над золотой вершиной холма. В тишине раздавался лишь мерный шум прозрачного ручья.',
          english: 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness.',
        },
      },
      {
        id: 't8_l2',
        tierNumber: 8,
        lessonNumber: 2,
        title: {
          uzbek_latin: '2-dars: O\'tkan kunlar (11-bob)',
          uzbek_cyrillic: '2-дарс: Ўткан кунлар (11-боб)',
          russian: 'Урок 2: Классический отрывок (Глава 2)',
          english: 'Lesson 2: Literary Classic (Chapter 2)',
        },
        content: {
          uzbek_latin: uzLiterature.entries[1].text,
          uzbek_cyrillic: 'Кечки соат бешларда қутидорнинг ҳавлиси тўрт кўз билан куяв келишини кутадир. Куяв учун паловлар, қуюқ-суюқ ошлар, неча турлик неъматлар ҳозирланиб, булар ҳам куявнинг интизорида турадирлар.',
          russian: 'Мороз и солнце; день чудесный! Еще ты дремлешь, друг прелестный — Пора, красавица, проснись: Открой сомкнуты негой взоры Навстречу северной Авроры, Звездою севера явись!',
          english: 'To be, or not to be, that is the question: Whether \'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take arms against a sea of troubles And by opposing end them.',
        },
      },
      {
        id: 't8_l3',
        tierNumber: 8,
        lessonNumber: 3,
        title: {
          uzbek_latin: '3-dars: O\'tkan kunlar (43-bob)',
          uzbek_cyrillic: '3-дарс: Ўткан кунлар (43-боб)',
          russian: 'Урок 3: Классический отрывок (Глава 3)',
          english: 'Lesson 3: Literary Classic (Chapter 3)',
        },
        content: {
          uzbek_latin: uzLiterature.entries[6].text,
          uzbek_cyrillic: 'Ўн ольти-ўн йетти кунлик ой оқ булут ичидан қўтосланиб кўринар эди. Ҳамма хуфтан намозига кириб кеткан, кўчалар сув қуйғандек тинч эди.',
          russian: 'Все счастливые семьи похожи друг на друга, каждая несчастливая семья несчастлива по-своему. Все смешалось в доме Облонских.',
          english: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
        },
      },
    ],
  },
];

// Stable IDs retain previous achievements. Display order follows the learning path,
// not the historical tier numbers stored in academy_progress.
const localized = (uz: string, cy: string, ru: string, en: string): Record<Language, string> => ({
  uzbek_latin: uz, uzbek_cyrillic: cy, russian: ru, english: en,
});
const drill = (id: string, tierNumber: number, lessonNumber: number, title: Record<Language, string>, latin: string, russian: string = latin, cyrillic: string = russian): import('../types').AcademyLesson => ({
  id, tierNumber, lessonNumber, title, content: { uzbek_latin: latin, english: latin, russian, uzbek_cyrillic: cyrillic },
});
const letters = [
  drill('t1_l1', 1, 1, localized('F va J: birinchi qadam', 'А ва О: биринчи қадам', 'А и О: первые шаги', 'F and J: first steps'), 'f j f j ff jj fj jf f j fj jf', 'а о а о аа оо ао оа а о ао оа'),
  drill('t1_l2', 1, 2, localized('D va K: ikki qo‘l', 'В ва Л: икки қўл', 'В и Л: две руки', 'D and K: both hands'), 'd k d k dd kk dk kd fd jk df kj', 'в л в л вв лл вл лв ва ол ав ло'),
  drill('t1_l3', 1, 3, localized('S va L: asosiy qator', 'Қ ва Д: асосий қатор', 'Ы и Д: основной ряд', 'S and L: home row'), 's l s l ss ll sl ls sd kl ds lk', 'ы д ы д ыы дд ыд ды ыв лд вы дл', 'қ д қ д ққ дд қд дқ қв лд вқ дл'),
  drill('t1_l4', 1, 4, localized('A: chap jimjiloq', 'Ф: чап жимжилоқ', 'Ф: левый мизинец', 'A: left little finger'), 'a s d f j k l a as df jk la fads', 'ф ы в а о л д ф фы ва ол дф фава', 'ф қ в а о л д ф фқ ва ол дф фава'),
  drill('t1_l5', 1, 5, localized('G va H: markaz', 'П ва Р: марказ', 'П и Р: центр', 'G and H: the centre'), 'g h g h fg jh gf hj gag had flag', 'п р п р ап ор па ро папа пара'),
  drill('t1_l6', 1, 6, localized('Yuqori qator: E va I', 'Юқори қатор: У ва Ш', 'Верхний ряд: У и Ш', 'Top row: E and I'), 'e i e i de ki ed ik fed kid side', 'у ш у ш ву лш ув шл шла ушла'),
  drill('t1_l7', 1, 7, localized('Yuqori qatorni kengaytiramiz', 'Юқори қаторни кенгайтирамиз', 'Осваиваем верхний ряд', 'Explore the top row'), 'q w r t y u o p we are you top red', 'й ц к е н г щ з йц ке нг щз река', 'й ц к е н г ў з йц ке нг ўз река'),
  drill('t1_l8', 1, 8, localized('Quyi qator va takrorlash', 'Қуйи қатор ва такрорлаш', 'Нижний ряд и повторение', 'Bottom row and review'), 'z x c v b n m zx cv bn nm can man', 'я ч с м и т ь б ю яч см ит ьб ю', 'я ч с м и т ь б ю яч см ит ьб ю'),
];
letters.push(drill('t1_l9', 1, 9, localized('Harflarni mustahkamlaymiz', 'Ў Қ Ғ Ҳ: махсус ҳарфлар', 'Ё Ж Э: повторение букв', 'Complete the letter review'), 'a s d f g h j k l q w e r t y u i o p z x c v b n m', 'ё ж э ёё жж ээ ёж жэ эж', 'ў қ ғ ҳ ўў ққ ғғ ҳҳ ўқ ғҳ қў ҳғ'));
const numbers = [
  drill('t5_l1', 5, 1, localized('1 dan 5 gacha', '1 дан 5 гача', 'От 1 до 5', 'Numbers 1 to 5'), '1 2 3 4 5 11 22 33 44 55 12 34 45'),
  drill('t5_l2', 5, 2, localized('6 dan 0 gacha', '6 дан 0 гача', 'От 6 до 0', 'Numbers 6 to 0'), '6 7 8 9 0 66 77 88 99 00 67 89 90'),
  drill('t5_l3', 5, 3, localized('Raqamlar ritmi', 'Рақамлар ритми', 'Ритм чисел', 'Number rhythm'), '12 34 56 78 90 123 456 789 2026 1000'),
  drill('t5_l4', 5, 4, localized('Sana va vaqt', 'Сана ва вақт', 'Дата и время', 'Dates and time'), '10:30 12:45 08:00 2026 15.05 21.06 7 14 28'),
];
const easy = LEGACY_TIERS.find(t => t.number === 2)!;
const shortWords = [
  localized('uy oy ot it un suv non ona ota men sen', 'уй ой от ит ун сув нон она ота мен сен', 'дом кот лес мир сон сад чай сыр нос рот', 'cat dog sun pen map red sky top cup bed'),
  localized('bola aka uka opa dala olma asal gul kun tun', 'бола ака ука опа дала олма асал гул кун тун', 'мама папа рука нога окно вода хлеб утро', 'home hand book tree rain wind milk fish'),
  localized('kitob qalam maktab yangi yaxshi do‘st shahar', 'китоб қалам мактаб янги яхши дўст шаҳар', 'книга школа город новый добрый письмо', 'school friend green happy story learn'),
];
const sentenceTier = LEGACY_TIERS.find(t => t.number === 3)!;
const simpleSentences = [
  localized('men kitob olaman sen ham yoz biz birga mashq qilamiz har kuni ozgina yoz', 'мен китоб оламан сен ҳам ёз биз бирга машқ қиламиз ҳар куни озгина ёз', 'я читаю книгу мы учимся вместе ты пишешь слова каждый день', 'i can type you can learn we practise together a little every day'),
  localized('Bugun havo yaxshi. Men yangi kitob o‘qidim. Har kuni mashq qilaman.', 'Бугун ҳаво яхши. Мен янги китоб ўқидим. Ҳар куни машқ қиламан.', 'Сегодня хорошая погода. Я читаю новую книгу. Мы учимся каждый день.', 'Today is a good day. I read a new book. We learn a little every day.'),
];
const BASE_TIERS: AcademyTier[] = [
  { ...LEGACY_TIERS[0], lessons: letters },
  { ...LEGACY_TIERS.find(t => t.number === 5)!, lessons: numbers },
  { ...easy, lessons: easy.lessons.map((l, i) => ({ ...l, tierNumber: 2, content: shortWords[i] })) },
  { ...sentenceTier, lessons: sentenceTier.lessons.map((l, i) => ({ ...l, content: simpleSentences[i] })) },
  ...[4, 6, 7, 8].map(n => LEGACY_TIERS.find(t => t.number === n)!),
];


const languages: Language[] = ['uzbek_latin', 'uzbek_cyrillic', 'russian', 'english'];
const wordBanks = { uzbek_latin: uzEasy.words, uzbek_cyrillic: cyEasy.words, russian: ruEasy.words, english: enEasy.words };
const sentenceBanks = { uzbek_latin: uzMedium.sentences, uzbek_cyrillic: cyMedium.sentences, russian: ruMedium.sentences, english: enMedium.sentences };
const complexBanks = { uzbek_latin: uzHard.sentences, uzbek_cyrillic: cyHard.sentences, russian: ruHard.sentences, english: enHard.sentences };

// Deterministic practice keeps a lesson stable across devices. Rotate whole tokens
// or sentences; never truncate a word or introduce future keys in beginner drills.
function practiceText(units: string[], minimum: number, offset: number): string {
  const selected: string[] = [];
  let length = 0;
  for (let i = 0; length < minimum; i++) {
    const unit = units[(offset + i) % units.length].trim();
    selected.push(unit);
    length += unit.length + (i > 0 ? 1 : 0);
  }
  return selected.join(' ');
}

const minimumLength: Record<number, number> = { 1: 240, 5: 300, 2: 400, 3: 550, 4: 650, 6: 650, 7: 850, 8: 1000 };

export const ACADEMY_TIERS: AcademyTier[] = BASE_TIERS.map(tier => {
  const usedTexts = Object.fromEntries(languages.map(language => [language, new Set<string>()])) as Record<Language, Set<string>>;
  return ({
  ...tier,
  lessons: Array.from({ length: 20 }, (_, index) => {
    const existing = tier.lessons[index];
    const seed = existing || tier.lessons[(index - tier.lessons.length) % tier.lessons.length];
    const content = {} as Record<Language, string>;
    for (const language of languages) {
      let units: string[];
      if (tier.number === 1 || tier.number === 5) {
        units = seed.content[language].split(/\s+/);
        if (!existing) {
          // Consolidation includes only keys already introduced in this section.
          const learned = tier.lessons.flatMap(l => l.content[language].split(/\s+/));
          units = Array.from(new Set(learned));
        }
      } else if (tier.number === 2) {
        units = [...seed.content[language].split(/\s+/), ...wordBanks[language]];
      } else if (tier.number === 3 || tier.number === 4) {
        units = [seed.content[language], ...sentenceBanks[language].map(text => text[0].toUpperCase() + text.slice(1))];
      } else if (tier.number === 6 || tier.number === 7) {
        units = [seed.content[language], ...complexBanks[language]];
      } else {
        // Retain literary material instead of mixing in unrelated typing phrases.
        units = language === 'uzbek_latin'
          ? uzLiterature.entries.map(entry => entry.text)
          : tier.lessons.flatMap(l => l.content[language].match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [l.content[language]]);
      }
      const minimum = minimumLength[tier.number] + index * (tier.number === 1 || tier.number === 5 ? 12 : 25);
      const offset = existing ? 0 : index * 7;
      content[language] = practiceText(units, minimum, offset);
      // Keep the original exercise opening and the IDs used by saved progress.
      if (existing && !content[language].startsWith(existing.content[language])) {
        content[language] = existing.content[language] + ' ' + content[language];
      }
      let extra = 0;
      while (usedTexts[language].has(content[language])) {
        content[language] += ' ' + units[(offset + extra++) % units.length].trim();
      }
      usedTexts[language].add(content[language]);
    }
    const number = index + 1;
    return {
      ...seed,
      id: existing?.id || `t${tier.number}_l${number}`,
      tierNumber: tier.number,
      lessonNumber: number,
      title: existing?.title || localized(
        `${number}-dars: ${tier.name.uzbek_latin} — mustahkamlash ${number - tier.lessons.length}`,
        `${number}-дарс: ${tier.name.uzbek_cyrillic} — мустаҳкамлаш ${number - tier.lessons.length}`,
        `Урок ${number}: ${tier.name.russian} — практика ${number - tier.lessons.length}`,
        `Lesson ${number}: ${tier.name.english} — practice ${number - tier.lessons.length}`,
      ),
      content,
    };
  }),
});
});
