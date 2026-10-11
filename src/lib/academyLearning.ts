import type { Language, AcademyLesson, LessonProgress } from '../types';

export function starGoals(tier: number) {
  const beginner = tier === 1 || tier === 5;
  return { beginner, pass: beginner ? 60 : 70, two: beginner ? 80 : 85,
    three: beginner ? 90 : 92, speed: tier === 2 ? 12 : tier <= 6 ? 20 : 30 };
}
export function calculateTierStars(tier: number, wpm: number, accuracy: number): number {
  if (!Number.isFinite(wpm) || !Number.isFinite(accuracy) || wpm < 0 || accuracy < 0 || accuracy > 100) return 0;
  const goal = starGoals(tier);
  if (accuracy < goal.pass) return 0;
  if (accuracy >= goal.three && (goal.beginner || wpm >= goal.speed || accuracy >= 98)) return 3;
  if (accuracy >= goal.two) return 2;
  return 1;
}
// Skipping part of a word must reduce lesson accuracy, even when every typed key was correct.
export function academyAccuracy(result: {correctChars: number; totalTyped: number; missedChars: number}) {
  const total = result.totalTyped + result.missedChars;
  return total > 0 ? Math.min(100, Math.max(0, Math.round(result.correctChars / total * 1000) / 10)) : 0;
}
export function lessonUnlocked(lesson: AcademyLesson, lessons: AcademyLesson[], progress: Record<string, LessonProgress>) {
  const index = lessons.findIndex(l => l.id === lesson.id);
  // Retain access to lessons already completed in the previous curriculum.
  return index === 0 || Boolean(progress[lesson.id]?.completed || progress[lesson.id]?.stars) ||
    (index > 0 && Boolean(progress[lessons[index - 1].id]?.completed || progress[lessons[index - 1].id]?.stars));
}
export const KEY_ROWS = [
  ['`', '1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
  ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['Caps','a','s','d','f','g','h','j','k','l',';',"'",'Enter'],
  ['ShiftLeft','z','x','c','v','b','n','m',',','.','/','ShiftRight'],
  ['Space'],
];
const ru: Record<string,string> = Object.fromEntries([..."qwertyuiop[]asdfghjkl;'zxcvbnm,./`"].map((k,i) => [k,[..."йцукенгшщзхъфывапролджэячсмитьбю.ё"][i]]));
const uz = { ...ru, s: 'қ', o: 'ў', '-': 'ғ', '=': 'ҳ' };
const shiftedLatin: Record<string,string> = Object.fromEntries([..."`1234567890-=[]\\;',./"].map((k,i) => [k,[..."~!@#$%^&*()_+{}|:\"<>?"][i]]));
const shiftedCyrillic: Record<string,string> = { '`':'Ё', '1':'!', '2':'"', '3':'№', '4':';', '5':'%', '6':':', '7':'?', '8':'*', '9':'(', '0':')', '-':'_', '=':'+', '\\':'/', '/':',' };
export type KeyboardLayout = 'latin' | 'russian' | 'uzbek';
export function defaultLayout(language: Language): KeyboardLayout {
  return language === 'russian' ? 'russian' : language === 'uzbek_cyrillic' ? 'uzbek' : 'latin';
}
export function keyLabel(key: string, layout: KeyboardLayout): string {
  return layout === 'latin' ? key : (layout === 'uzbek' ? uz : ru)[key] || key;
}
export function keyGuide(char: string, layout: KeyboardLayout): { key: string; shift: boolean; finger: number } | null {
  if (char === ' ') return { key:'Space', shift:false, finger:4 };
  if (char === 'Backspace') return { key:'Backspace', shift:false, finger:9 };
  char = /[‘’ʻʼ]/.test(char) ? "'" : char;
  for (const row of KEY_ROWS) for (const key of row) {
    if (key.length !== 1) continue;
    const base = keyLabel(key,layout);
    const shifted = layout === 'latin' ? shiftedLatin[key] : layout === 'uzbek' && key === '-' ? 'Ғ' : layout === 'uzbek' && key === '=' ? 'Ҳ' : shiftedCyrillic[key];
    if (base === char || base.toUpperCase() === char || shifted === char) {
      const finger = fingerFor(key);
      return { key, shift: base !== char, finger };
    }
  }
  return null;
}
export function fingerFor(key: string): number {
  if ('`1qaz'.includes(key)) return 0;
  if ('2wsx'.includes(key)) return 1;
  if ('3edc'.includes(key)) return 2;
  if ('45rtfgvb'.includes(key)) return 3;
  if ('67yuhjnm'.includes(key)) return 6;
  if ('8ik,'.includes(key)) return 7;
  if ('9ol.'.includes(key)) return 8;
  if (key === 'Space') return 4;
  return 9;
}
export const academyCopy: Record<Language, string[]> = {
  uzbek_latin: ['Noldan erkin yozishgacha','Kichik qadamlar. Aniq yozish. Har darsda yangi ko‘nikma.','Mashqni davom ettirish','Birinchi darsni boshlash','Natijalaringiz saqlanishi uchun ro‘yxatdan o‘ting','Hozirgi natijalar faqat shu sessiyada qoladi.','Dars','Aniqlik','Keyingi tugma','Barmoqlarni F va J bo‘rtmalariga qo‘ying. Ekranga qarab, shoshilmay yozing.','Klaviatura ko‘rsatmasi','Ko‘rsatish','Yashirish','Bo‘sh joy','Chap','O‘ng','jimjiloq','nomsiz','o‘rta','ko‘rsatkich','bosh barmoq','OS klaviatura tilingiz shu tartibga mos bo‘lsin.','Shift’ni qarama-qarshi qo‘l bilan bosing.','Tezlik shart emas','Deyarli xatosiz (98%) yozish ham 3 yulduz beradi.','Zo‘r! Keyingi qadamga tayyorsiz.','Yaxshi boshlanish! Sekinroq yozib, aniqlikni oshiring.','Avval aniqlik. Xato qilsangiz, Backspace bilan tuzating.','Shu harflarni yana mashq qiling','Xatolar ustida mashq','Mashq tugadi. Asosiy darsga qayting.','Keyingi dars avvalgisidan kamida 1 yulduz olganda ochiladi.','Tugma ushbu tartibda yo‘q. Klaviatura tartibini tekshiring.'],
  uzbek_cyrillic: ['Нолдан эркин ёзишгача','Кичик қадамлар. Аниқ ёзиш. Ҳар дарсда янги кўникма.','Машқни давом эттириш','Биринчи дарсни бошлаш','Натижаларингиз сақланиши учун рўйхатдан ўтинг','Ҳозирги натижалар фақат шу сессияда қолади.','Дарс','Аниқлик','Кейинги тугма','Бармоқларни F ва J бўртмаларига қўйинг. Экранга қараб, шошилмай ёзинг.','Клавиатура кўрсатмаси','Кўрсатиш','Яшириш','Бўш жой','Чап','Ўнг','жимжилоқ','номсиз','ўрта','кўрсаткич','бош бармоқ','OS клавиатура тилингиз шу тартибга мос бўлсин.','Shift’ни қарама-қарши қўл билан босинг.','Тезлик шарт эмас','Деярли хатосиз (98%) ёзиш ҳам 3 юлдуз беради.','Зўр! Кейинги қадамга тайёрсиз.','Яхши бошланиш! Секинроқ ёзиб, аниқликни оширинг.','Аввал аниқлик. Хато қилсангиз, Backspace билан тузатинг.','Шу ҳарфларни яна машқ қилинг','Хатолар устида машқ','Машқ тугади. Асосий дарсга қайтинг.','Кейинги дарс аввалгисидан камида 1 юлдуз олганда очилади.','Тугма ушбу тартибда йўқ. Клавиатура тартибини текширинг.'],
  russian: ['От первых клавиш к уверенной печати','Короткие шаги. Точная печать. Новый навык в каждом уроке.','Продолжить обучение','Начать первый урок','Зарегистрируйтесь, чтобы сохранять результаты','Результаты гостя остаются только в этой сессии.','Урок','Точность','Следующая клавиша','Поставьте пальцы на выступы F и J. Смотрите на экран и не спешите.','Подсказка клавиатуры','Показать','Скрыть','Пробел','Левый','Правый','мизинец','безымянный','средний','указательный','большой','Выберите такой же язык клавиатуры в вашей ОС.','Нажмите Shift противоположной рукой.','Скорость не требуется','Почти безошибочная печать (98%) тоже даёт 3 звезды.','Отлично! Вы готовы к следующему шагу.','Хорошее начало! Замедлитесь и улучшите точность.','Сначала точность. Исправляйте ошибки клавишей Backspace.','Повторить эти буквы','Практика ошибок','Практика завершена. Вернитесь к основному уроку.','Следующий урок открывается после получения хотя бы 1 звезды.','Клавиши нет в этой раскладке. Проверьте раскладку.'],
  english: ['From first keys to fluent typing','Small steps. Accurate typing. A new skill in every lesson.','Continue learning','Start the first lesson','Sign up to save your progress','Guest progress lasts for this session only.','Lesson','Accuracy','Next key','Rest your fingers on the F and J bumps. Look at the screen and take your time.','Keyboard guidance','Show','Hide','Space','Left','Right','little finger','ring finger','middle finger','index finger','thumb','Match this layout to your operating system keyboard.','Press Shift with the opposite hand.','No speed requirement','Near-perfect accuracy (98%) also earns 3 stars.','Great! You are ready for the next step.','Good start! Slow down and improve your accuracy.','Accuracy first. Use Backspace to correct mistakes.','Practise these letters again','Mistake practice','Practice complete. Return to the main lesson.','The next lesson unlocks after earning at least 1 star.','Key unavailable in this layout. Check your keyboard layout.'],
};
