export interface ArticleSection {
  heading?: string;
  paragraphs?: string[];
  listItems?: string[];
}

export interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  sections: ArticleSection[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'klaviaturada-tez-yozish',
    title: "Klaviaturada tez yozishni qanday o'rganish mumkin",
    description: "Klaviaturada tez yozish — bu tug'ma qobiliyat emas, balki mashq orqali rivojlanadigan oddiy ko'nikma. To'g'ri usulda mashq qilsangiz, bir necha hafta ichida sezilarli farqni ko'rasiz.",
    date: '2026-08-09',
    readTime: '4 min o\'qish',
    sections: [
      {
        paragraphs: [
          "Klaviaturada tez yozish — bu tug'ma qobiliyat emas, balki mashq orqali rivojlanadigan oddiy ko'nikma. To'g'ri usulda mashq qilsangiz, bir necha hafta ichida sezilarli farqni ko'rasiz. Mana bosqichma-bosqich yo'l."
        ]
      },
      {
        heading: "1. Barmoqlarni to'g'ri joylashtiring",
        paragraphs: [
          "Har bir barmoq klaviaturada o'z \"uyi\"ga ega bo'lishi kerak — bu asosiy qator (home row) deb ataladi: chap qo'l uchun A-S-D-F, o'ng qo'l uchun J-K-L-;. Har safar yozishni boshlashdan oldin barmoqlaringizni shu qatorga qo'ying. Boshida bu noqulay tuyulishi mumkin, lekin bu — tez yozishning poydevori."
        ]
      },
      {
        heading: "2. Klaviaturaga qaramaslikni o'rganing",
        paragraphs: [
          "Bu eng qiyin, lekin eng muhim qadam. Klaviaturaga qarab yozish tezlikni tubdan pasaytiradi, chunki ko'z doimo ekran va klaviatura orasida \"sakraydi\". Mashq qilishning eng yaxshi usuli — birinchi haftalarda ataylab sekin, lekin klaviaturaga qaramasdan yozish. Tezlik keyin o'z-o'zidan keladi."
        ]
      },
      {
        heading: "3. Aniqlikni tezlikdan ustun qo'ying",
        paragraphs: [
          "Ko'p odamlar xato qiladigan narsa — boshida tezlikka intilish. Aslida teskarisi to'g'ri: avval 100% aniqlik bilan yozishni o'rganing, tezlik esa vaqt o'tishi bilan tabiiy ravishda oshadi. Xato bilan tez yozish — sekin, lekin to'g'ri yozishdan ko'ra foydasizroq, chunki xatolarni tuzatish vaqtni ko'proq oladi."
        ]
      },
      {
        heading: "4. Bosqichma-bosqich murakkablashtiring",
        paragraphs: [
          "To'g'ridan-to'g'ri murakkab matnlardan boshlamang. Tabiiy o'sish yo'li quyidagicha:"
        ],
        listItems: [
          "Harflar va harf birikmalari — asosiy qatordan boshlab, keyin yuqori va pastki qatorlarga o'ting",
          "Oddiy so'zlar — qisqa, tez-tez ishlatiladigan so me'yoriy so'zlar",
          "Jumlalar — tinish belgilari bilan tabiiy matn",
          "Raqamlar va maxsus belgilar — @ # % kabi belgilar, sanalar",
          "Uzun, murakkab matnlar — haqiqiy maqolalar, adabiy parchalar"
        ]
      },
      {
        heading: "5. Har kuni, qisqa vaqt mashq qiling",
        paragraphs: [
          "Haftada bir marta bir soat mashq qilishdan ko'ra, har kuni 10-15 daqiqa mashq qilish ancha samaraliroq — bu mushak xotirasini (muscle memory) shakllantiradi, bu esa tez yozishning asosiy siri."
        ]
      },
      {
        heading: "Qalampir bilan mashq qiling",
        paragraphs: [
          "Qalampir'ning Akademiya bo'limi aynan shu bosqichma-bosqich tizim asosida qurilgan — harflardan boshlab, so'zlar, tinish belgilari, raqamlar va murakkab matnlargacha. Har bir darsdan so'ng yulduzcha bahosi bilan o'z natijangizni ko'rasiz va qayerda ko'proq mashq kerakligini aniq bilib olasiz. O'zbek, rus va ingliz tillarida — bepul."
        ]
      }
    ]
  },
  {
    slug: 'eng-yaxshi-mashqlar',
    title: "Eng yaxshi tez yozish mashqlari",
    description: "Tez yozishni yaxshilash uchun barcha mashqlar bir xil samarali emas. Mana haqiqatan natija beradigan mashq turlari, eng foydalisidan boshlab.",
    date: '2026-08-09',
    readTime: '3 min o\'qish',
    sections: [
      {
        paragraphs: [
          "Tez yozishni yaxshilash uchun barcha mashqlar bir xil samarali emas. Mana haqiqatan natija beradigan mashq turlari, eng foydalisidan boshlab."
        ]
      },
      {
        heading: "1. Asosiy qator mashqlari",
        paragraphs: [
          "Eng zerikarli, lekin eng zarur mashq turi. asdf jkl; kabi ketma-ketliklarni takrorlash barmoqlarning to'g'ri joyini \"yodda saqlashi\"ga yordam beradi. Buni har kungi mashqning boshida 2-3 daqiqa qilish tavsiya etiladi."
        ]
      },
      {
        heading: "2. Tez-tez uchraydigan so'zlar mashqi",
        paragraphs: [
          "Har qanday tilda eng ko'p ishlatiladigan 100-150 ta so'z bor (\"va\", \"bu\", \"men\", \"uchun\" kabi). Aynan shu so'zlarni tez va xatosiz yoza olish — umumiy tezlikka eng katta ta'sir ko'rsatadigan omil, chunki ular matnning katta qismini tashkil qiladi."
        ]
      },
      {
        heading: "3. Vaqt bo'yicha testlar (15/30/60 soniya)",
        paragraphs: [
          "Qisqa vaqtli testlar (15-30 soniya) tezlikka e'tiborni jamlashga yordam beradi, uzunroq testlar (60-120 soniya) esa barqarorlikni (consistency) o'lchaydi — ya'ni siz boshida tez, oxirida sekin yozmaysizmi, yoki butun davomida bir xil tezlikni saqlaysizmi."
        ]
      },
      {
        heading: "4. Tinish belgilari va raqamlar mashqi",
        paragraphs: [
          "Ko'pchilik so'zlarni tez yozadi, lekin vergul, nuqta, qavs yoki raqamlarga kelganda sekinlashadi. Bu — alohida mashq qilish kerak bo'lgan ko'nikma, chunki haqiqiy hayotda (elektron xatlar, hisobotlar) bunday belgilar doim uchraydi."
        ]
      },
      {
        heading: "5. \"Zaif tugmalar\" mashqi",
        paragraphs: [
          "Har birimizning ma'lum harflarda ko'proq xato qiladigan o'ziga xos zaifligimiz bor — masalan, ba'zilar \"q\" va \"w\" harflarini, ba'zilar esa raqamlar qatorini qiynaladi. Eng samarali mashq — aynan o'zingiz ko'p xato qiladigan harflarga qaratilgan maxsus mashqlar, umumiy matn emas."
        ]
      },
      {
        heading: "6. Adabiy matnlar bilan mashq",
        paragraphs: [
          "Oddiy, sun'iy jumlalar o'rniga haqiqiy adabiy asarlar bilan mashq qilish — nafaqat tezlikni oshiradi, balki tabiiy jumla tuzilishiga ham o'rganib qolasiz, bu esa real hayotdagi yozishga yaqinroq."
        ]
      },
      {
        heading: "7. Raqobat asosidagi mashqlar",
        paragraphs: [
          "Yolg'iz mashq qilish ba'zida zerikarli bo'lishi mumkin. Reyting jadvali yoki boshqalar bilan taqqoslash imkoniyati motivatsiyani sezilarli oshiradi — chunki o'z natijangizni ko'rish o'rniga, boshqalarga nisbatan qayerda turganingizni ko'rasiz."
        ]
      },
      {
        heading: "Bularning barchasi bitta joyda",
        paragraphs: [
          "Qalampir yuqoridagi mashq turlarining barchasini o'z ichiga oladi: oson/o'rtacha/qiyin darajalar, vaqt va so'z soni bo'yicha testlar, Akademiyada tuzilgan darslar, va jonli reyting jadvali — o'zbek, rus va ingliz tillarida, bepul."
        ]
      }
    ]
  },
  {
    slug: 'tez-yozish-oyinlari',
    title: "Tez yozish o'yinlari: Qalampir va boshqalar",
    description: "Tez yozishni o'rganish shart emas zerikarli bo'lishi kerak. So'nggi yillarda \"tez yozish o'yini\" tushunchasi mashhur bo'lib bormoqda — bu oddiy testlarni raqobat, mukofot va o'yin elementlari bilan boyitilgan formatga aylantiradi.",
    date: '2026-08-09',
    readTime: '3 min o\'qish',
    sections: [
      {
        paragraphs: [
          "Tez yozishni o'rganish shart emas zerikarli bo'lishi kerak. So'nggi yillarda \"tez yozish o'yini\" tushunchasi mashhur bo'lib bormoqda — bu oddiy testlarni raqobat, mukofot va o'yin elementlari bilan boyitilgan formatga aylantiradi."
        ]
      },
      {
        heading: "Nima uchun o'yin formati ishlaydi",
        paragraphs: [
          "Psixologik jihatdan, oddiy \"mashq\" so'zi ko'pchilikni zeriktiradi, lekin \"o'yin\" so'zi qiziqish uyg'otadi. Reyting jadvali, ball to'plash, yoki do'stlar bilan raqobatlashish — bularning barchasi miyani mukofot kutishga undaydi, bu esa odamlarni qaytib kelishga undaydigan asosiy omil."
        ]
      },
      {
        heading: "Tez yozish o'yinlarining asosiy tualari",
        paragraphs: [
          "Tezlik testlari — eng keng tarqalgan format: belgilangan vaqt yoki so'z sonida qanchalik tez va aniq yoza olishingizni o'lchaydi. Xalqaro platformalarda (masalan, Monkeytype kabi) bu format juda mashhur, lekin ko'pchiligi faqat ingliz tilida ishlaydi.",
          "Bosqichli darslar — harflardan boshlab, so'zlar va murakkab matnlargacha bo'lgan tizimli o'sish, odatda yulduzcha yoki ball bilan baholanadi. Bu format ayniqsa yangi boshlovchilar uchun foydali, chunki tasodifiy emas, rejalashtirilgan tarzda rivojlanish imkonini beradi.",
          "Poyga (racing) formatlari — bir nechta ishtirokchi bir xil matnni bir vaqtda yozib, kim birinchi tugatishini ko'radigan format. Bu — eng raqobatbardosh va ijtimoiy format, chunki real vaqtda boshqalar bilan \"poyga\"ga chiqasiz."
        ]
      },
      {
        heading: "O'zbek tilidagi bo'shliq",
        paragraphs: [
          "Yuqoridagi formatlarning aksariyati ingliz tilida yaratilgan va o'zbek tilini butunlay qo'llab-quvvatlamaydi — yoki bo'lsa ham, sifatsiz tarjima qilingan matnlar bilan. Bu esa o'zbek foydalanuvchilar uchun haqiqiy, tabiiy o'zbek matnlarida mashq qilish imkoniyatini cheklaydi."
        ]
      },
      {
        heading: "Qalampir qanday yondashadi",
        paragraphs: [
          "Qalampir aynan shu bo'shliqni to'ldirish uchun yaratilgan — o'zbek (lotin va kirill), rus va ingliz tillarida tabiiy matnlar bilan tez yozish testi, jonli reyting jadvali (kunlik, haftalik, oylik va umumiy), va harflardan murakkab matnlargacha bosqichma-bosqich Akademiya darslari. Hammasi bepul, hisob yaratib darhol boshlash mumkin."
        ]
      }
    ]
  }
];
