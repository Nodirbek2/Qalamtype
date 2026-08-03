import React, { useState, useEffect } from 'react';
import { X, Shield, Globe, Landmark, Eye, HeartHandshake, HelpCircle } from 'lucide-react';
import { Language } from '../types';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage: Language;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, defaultLanguage }) => {
  const [activeTab, setActiveTab] = useState<Language>('uzbek');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultLanguage);
    }
  }, [isOpen, defaultLanguage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-3xl bg-[#1A1917] border border-[rgba(232,226,216,0.12)] rounded-2xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(232,226,216,0.08)] bg-[#0F0E0D]/50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#E85D3D]/10 flex items-center justify-center text-[#E85D3D]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#E8E2D8] tracking-tight">
                {activeTab === 'uzbek' && 'Maxfiylik siyosati'}
                {activeTab === 'russian' && 'Политика конфиденциальности'}
                {activeTab === 'english' && 'Privacy Policy'}
              </h2>
              <p className="text-[11px] font-mono text-[#9A9488]">
                {activeTab === 'uzbek' && 'Oxirgi yangilanish: 03.08.2026'}
                {activeTab === 'russian' && 'Последнее обновление: 03.08.2026'}
                {activeTab === 'english' && 'Last updated: 03.08.2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Language Switcher Tabs inside the Modal */}
            <div className="flex bg-[#0F0E0D] border border-[rgba(232,226,216,0.08)] rounded-lg p-0.5 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => setActiveTab('uzbek')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'uzbek'
                    ? 'bg-[#E85D3D] text-[#4A1B0C] font-semibold'
                    : 'text-[#9A9488] hover:text-[#E8E2D8]'
                }`}
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('russian')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'russian'
                    ? 'bg-[#E85D3D] text-[#4A1B0C] font-semibold'
                    : 'text-[#9A9488] hover:text-[#E8E2D8]'
                }`}
              >
                RU
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('english')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  activeTab === 'english'
                    ? 'bg-[#E85D3D] text-[#4A1B0C] font-semibold'
                    : 'text-[#9A9488] hover:text-[#E8E2D8]'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#9A9488] hover:text-[#E8E2D8] hover:bg-[rgba(232,226,216,0.06)] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#9A9488] font-sans text-xs leading-relaxed max-h-[calc(85vh-70px)] selection:bg-[#E85D3D] selection:text-[#0F0E0D]">
          
          {/* UZBEK VERSION */}
          {activeTab === 'uzbek' && (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">1.</span> Biz kimmiz
                </h3>
                <p>
                  Qalampir hozirda jismoniy shaxs / shaxsiy loyiha sifatida ishlamoqda (ro'yxatdan o'tgan kompaniya emas). Aloqa elektron pochtasi: <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a>, telefon: <span className="text-[#E8E2D8] font-mono">+998 33 009 00 35</span>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">2.</span> Biz qanday ma'lumotlarni yig'amiz
                </h3>
                <div className="space-y-3">
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Hisob ma'lumotlari (ro'yxatdan o'tganingizda):</strong>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Elektron pochta manzili</li>
                      <li>Foydalanuvchi nomi (username)</li>
                      <li>Parol (Supabase Auth orqali xavfsiz tarzda shifrlangan/xesh qilingan holatda saqlanadi — biz sizning haqiqiy parolingizni hech qachon ko'rmaymiz va saqlamaymiz)</li>
                      <li>Ism va familiya (agar hisob sozlamalarida qo'shishni tanlasangiz)</li>
                      <li>Profil rasmi (agar yuklashni tanlasangiz)</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Agar Google orqali kirsangiz:</strong>
                    <p>Google hisobingizning ismi, elektron pochtasi va profil rasmi Google tizimi taqdim etgan tartibda olinadi.</p>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Yozish testi ma'lumotlari:</strong>
                    <p>Test natijalari: bir daqiqadagi so'zlar soni (WPM), aniqlik (accuracy), rejim, qiyinchilik darajasi, yozish tili va har bir yakunlangan test vaqti.</p>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Sozlamalar ma'lumotlari:</strong>
                    <p>Sayt tili, yozish tili, ovoz sozlamalari va kursor tezligi sozlamalari (tizimga kirgan bo'lsangiz, hisobingizda; mehmon bo'lsangiz, brauzeringizning kesh xotirasida saqlanadi).</p>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Avtomatik ravishda yig'iladigan ma'lumotlar:</strong>
                    <p>Xizmatni boshqarish va yaxshilash maqsadida Supabase orqali olinadigan asosiy texnik ma'lumotlar (masalan, foydalanish jurnallari, xatolar hisoboti).</p>
                  </div>
                </div>
                <p className="mt-2 bg-[#0F0E0D]/30 p-2.5 rounded-lg border border-[rgba(232,226,216,0.04)] font-mono text-[11px]">
                  Biz to'lov ma'lumotlarini yig'maymiz, chunki hozirda Xizmatda pullik to'lovlar va tranzaksiyalar mavjud emas.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">3.</span> Ma'lumotlaringizdan qanday foydalanamiz
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Hisobingizni yaratish va boshqarish uchun</li>
                  <li>Yozish statistikasini va shaxsiy rivojlanish panelini hisoblash hamda ko'rsatish uchun</li>
                  <li>Peshqadamlar jadvalini ko'rsatish uchun (5-bo'limga qarang — bu ba'zi ma'lumotlaringizni ommaviy ko'rsatishni o'z ichiga oladi)</li>
                  <li>Sozlamalaringiz va afzalliklaringizni eslab qolish uchun</li>
                  <li>Xizmat faoliyatini yuritish, xavfsizligini ta'minlash va uni yaxshilash uchun</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">4.</span> Nimalar ommaviy va nimalar shaxsiy (maxfiy)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="p-3 bg-[#0F0E0D]/40 border border-[rgba(232,226,216,0.06)] rounded-xl space-y-1">
                    <span className="text-[#E85D3D] font-bold font-mono text-[10px] uppercase tracking-wider block">Ommaviy</span>
                    <p className="text-[11px]">
                      Peshqadamlar jadvali orqali istalgan tashrif buyuruvchiga ko'rinadi: foydalanuvchi nomi, profil rasmi, WPM (tezlik), aniqlik, test rejimi/qiyinchilik darajasi/tili va natija qayd etilgan sana.
                    </p>
                  </div>
                  <div className="p-3 bg-[#0F0E0D]/40 border border-[rgba(232,226,216,0.06)] rounded-xl space-y-1">
                    <span className="text-[#6FA85C] font-bold font-mono text-[10px] uppercase tracking-wider block">Shaxsiy (Maxfiy)</span>
                    <p className="text-[11px]">
                      Faqat sizga ko'rinadi: elektron pochta manzilingiz, ism va familiyangiz (agar ularni boshqa joyda ko'rsatishni tanlamagan bo'lsangiz) va peshqadamlar jadvalida ko'rsatilmaydigan batafsil test tarixingiz.
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-[11px]">
                  Agar yozish natijalaringiz yoki profil rasmingiz boshqa foydalanuvchilarga ko'rinishini istamasangiz, hisob yaratmang yoki boshqa variantlarni muhokama qilish uchun biz bilan bog'laning.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">5.</span> Ma'lumotlarni qaysi uchinchi tomonlar bilan baham ko'ramiz
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Supabase</strong>: autentifikatsiya, ma'lumotlar bazasi va fayllarni saqlash uchun.</li>
                  <li><strong>Google Tizimiga Kirish (ixtiyoriy)</strong>: agar siz Google orqali tizimga kirishni tanlasangiz, Google bizga ruxsatingizga asosan hisob ma'lumotlaringizni taqdim etadi.</li>
                </ul>
                <p>
                  Biz sizning shaxsiy ma'lumotlaringizni uchinchi shaxslarga sotmaymiz va ulardan reklama maqsadlarida foydalanmaymiz.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">6.</span> Kuki-fayllar va mahalliy xotira
                </h3>
                <p>
                  Biz foydalanuvchi tanlagan ovoz, kursor tezligi va til kabi sozlamalarni eslab qolish maqsadida brauzerning mahalliy xotirasidan (local storage/session storage) foydalanamiz (hech qanday reklama kuki-fayllaridan foydalanmaymiz).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">7.</span> Bolalar maxfiyligi
                </h3>
                <p>
                  Ushbu Xizmat 13 yoshga to'lmagan bolalarga mo'ljallanmagan va biz 13 yoshga to'lmagan bolalarning shaxsiy ma'lumotlarini qasddan yig'maymiz.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">8.</span> Ma'lumotlarni saqlash va o'chirish
                </h3>
                <p>
                  Siz istalgan vaqtda hisob sozlamalari orqali profilingizni o'chirishingiz mumkin. Bu sizning profilingiz ma'lumotlari, profil rasmi va test natijalaringizni to'liq o'chiradi. Agar ma'lumotlaringizni o'chirishda muammo yuzaga kelsa, <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a> elektron pochtasiga yozing.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">9.</span> Sizning huquqlaringiz
                </h3>
                <p>
                  Shaxsiy ma'lumotlaringizga kirish, ularni tuzatish, o'chirish yoki foydalanishni cheklash huquqiga egasiz. Siz ushbu huquqlarning aksariyatidan hisob sozlamalari orqali bevosita foydalanishingiz mumkin.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">10.</span> Xavfsizlik
                </h3>
                <p>
                  Ma'lumotlaringizni himoya qilish uchun biz Supabase platformasining o'rnatilgan xavfsizlik choralariga (xavfsiz autentifikatsiya, ma'lumotlar bazasidagi Row Level Security) tayanamiz. Mutlaq xavfsizlikni kafolatlay olmaymiz, biroq xavfsizlikni eng yuqori darajada ta'minlashga intilamiz.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">11.</span> Ushbu siyosatga o'zgartirishlar kiritish
                </h3>
                <p>
                  Biz ushbu Siyosatni vaqti-vaqti bilan yangilab turishimiz mumkin. Yangi tahrir kuchga kirganda yuqoridagi yangilanish sanasini o'zgartiramiz.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">12.</span> Aloqa
                </h3>
                <p>
                  Savollar bo'lsa, quyidagi aloqa manziliga yozishingiz mumkin: <br />
                  Telegram: <a href="https://t.me/Nodirbek_B" target="_blank" rel="noopener noreferrer" className="text-[#E85D3D] hover:underline font-mono">@Nodirbek_B</a> <br />
                  Elektron pochta: <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a> <br />
                  Telefon: <span className="text-[#E8E2D8] font-mono">+998 33 009 00 35</span>
                </p>
              </section>
            </>
          )}

          {/* RUSSIAN VERSION */}
          {activeTab === 'russian' && (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">1.</span> Кто мы
                </h3>
                <p>
                  В настоящее время Qalampir управляется как индивидуальный/личный проект (не как зарегистрированная юридическая компания). Контактный email: <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a>, телефон: <span className="text-[#E8E2D8] font-mono">+998 33 009 00 35</span>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">2.</span> Какие данные мы собираем
                </h3>
                <div className="space-y-3">
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Данные аккаунта (при регистрации):</strong>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Адрес электронной почты</li>
                      <li>Имя пользователя (username)</li>
                      <li>Пароль (надежно шифруется и хэшируется через Supabase Auth — мы никогда не видим и не сохраняем его в чистом виде)</li>
                      <li>Имя и фамилия (по вашему желанию в настройках)</li>
                      <li>Фото профиля (если вы решите его загрузить)</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">При входе через Google:</strong>
                    <p>Имя вашего аккаунта Google, email и изображение профиля, передаваемые сервисом Google при авторизации.</p>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Данные тестов скорости печати:</strong>
                    <p>Результаты каждого теста: количество слов в минуту (WPM), точность (accuracy), режим, сложность, язык теста и точное время завершения.</p>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Настройки интерфейса:</strong>
                    <p>Язык сайта, язык печати, звуки клавиш, стиль каретки (хранятся в вашем аккаунте или в локальной памяти браузера, если вы не авторизованы).</p>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Автоматически собираемые данные:</strong>
                    <p>Технические логи через Supabase (информация об ошибках, журнал посещений) исключительно для аналитики стабильности работы Сервиса.</p>
                  </div>
                </div>
                <p className="mt-2 bg-[#0F0E0D]/30 p-2.5 rounded-lg border border-[rgba(232,226,216,0.04)] font-mono text-[11px]">
                  Мы не собираем реквизиты карт или платежную информацию, так как на платформе отсутствуют платные транзакции.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">3.</span> Как мы используем ваши данные
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Для создания, авторизации и управления вашим профилем</li>
                  <li>Для расчета вашей личной статистики печати и построения интерактивных графиков прогресса</li>
                  <li>Для публикации в глобальных рейтингах лучших результатов (подробнее в разделе 5)</li>
                  <li>Для автоматического сохранения выбранных вами настроек</li>
                  <li>Для анализа ошибок, технической поддержки и улучшения работы платформы</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">4.</span> Что публично, а что приватно
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="p-3 bg-[#0F0E0D]/40 border border-[rgba(232,226,216,0.06)] rounded-xl space-y-1">
                    <span className="text-[#E85D3D] font-bold font-mono text-[10px] uppercase tracking-wider block">Публично</span>
                    <p className="text-[11px]">
                      Видно любому гостю сайта в таблице рекордов: имя пользователя, аватар, WPM, точность, язык теста, выбранный режим и дата прохождения.
                    </p>
                  </div>
                  <div className="p-3 bg-[#0F0E0D]/40 border border-[rgba(232,226,216,0.06)] rounded-xl space-y-1">
                    <span className="text-[#6FA85C] font-bold font-mono text-[10px] uppercase tracking-wider block">Приватно</span>
                    <p className="text-[11px]">
                      Доступно только вам: email адрес, настоящие имя и фамилия (если указаны), и полная детальная история каждого теста.
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-[11px]">
                  Если вы против публикации рекордов скорости или аватара, вы можете заниматься на сайте без регистрации (как гость) или связаться с нами для удаления аккаунта.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">5.</span> Третьи стороны, с которыми делимся данными
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Supabase</strong>: облачная инфраструктура баз данных и авторизации.</li>
                  <li><strong>Google OAuth</strong> (при выборе этого метода): передает базовые данные о профиле.</li>
                </ul>
                <p>
                  Мы гарантируем, что не продаем личные данные пользователей и не передаем их рекламным сетям.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">6.</span> Файлы cookie и локальная память
                </h3>
                <p>
                  Мы используем хранилище браузера (local storage и session storage) исключительно для запоминания выбранных настроек звука клавиш, языка интерфейса и скорости каретки (без рекламного отслеживания).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">7.</span> Конфиденциальность несовершеннолетних
                </h3>
                <p>
                  Наш сервис не ориентирован на детей до 13 лет. Мы не собираем их данные намеренно. В случае обнаружения таких аккаунтов они удаляются (подробнее в Пользовательском соглашении).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">8.</span> Хранение и удаление данных
                </h3>
                <p>
                  Вы можете самостоятельно удалить аккаунт из настроек в любой момент. При этом мгновенно стираются все данные, фотографии и результаты тестов. По вопросам ручного удаления пишите на <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">9.</span> Ваши права
                </h3>
                <p>
                  Вы имеете право на доступ к своим данным, их редактирование, перенос и полное удаление. Большинство этих функций доступны напрямую в интерфейсе личного кабинета.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">10.</span> Безопасность
                </h3>
                <p>
                  Безопасность обеспечивается встроенными инструментами Supabase (включая авторизацию и политики Row Level Security на уровне таблиц баз данных). Мы делаем все возможное для защиты, но абсолютная безопасность в сети невозможна.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">11.</span> Изменения в Политике конфиденциальности
                </h3>
                <p>
                  Мы можем периодически обновлять эту Политику. В случае правок дата в шапке будет заменена на актуальную.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">12.</span> Контакты
                </h3>
                <p>
                  Свяжитесь с нами по любым вопросам: <br />
                  Telegram: <a href="https://t.me/Nodirbek_B" target="_blank" rel="noopener noreferrer" className="text-[#E85D3D] hover:underline font-mono">@Nodirbek_B</a> <br />
                  Email: <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a> <br />
                  Телефон: <span className="text-[#E8E2D8] font-mono">+998 33 009 00 35</span>
                </p>
              </section>
            </>
          )}

          {/* ENGLISH VERSION */}
          {activeTab === 'english' && (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">1.</span> Who we are
                </h3>
                <p>
                  Qalampir is currently operated as an individual/personal project (not a registered company). Contact email: <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a>, phone: <span className="text-[#E8E2D8] font-mono">+998 33 009 00 35</span>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">2.</span> What data we collect
                </h3>
                <div className="space-y-3">
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Account data (when you sign up):</strong>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Email address</li>
                      <li>Username</li>
                      <li>Password (stored securely/hashed by Supabase Auth — we never see or store your raw password)</li>
                      <li>First and last name, if you choose to add them in account settings</li>
                      <li>Profile photo, if you choose to upload one</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">If you sign in with Google:</strong>
                    <p>Your Google account's name, email, and profile photo, as provided to us by Google's sign-in flow.</p>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Typing test data:</strong>
                    <p>Test results: words per minute, accuracy, mode, difficulty, typing language, and timestamp for each completed test.</p>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Settings data:</strong>
                    <p>Site language, typing language, sound preference, and caret-speed preference, stored either to your account (if logged in) or locally in your browser (if you're a guest).</p>
                  </div>
                  <div>
                    <strong className="text-[#E8E2D8] block mb-1">Automatically collected data:</strong>
                    <p>Basic technical data via Supabase (e.g. general usage logs, error logs) to help us operate and improve the Service.</p>
                  </div>
                </div>
                <p className="mt-2 bg-[#0F0E0D]/30 p-2.5 rounded-lg border border-[rgba(232,226,216,0.04)] font-mono text-[11px]">
                  We do not collect payment information, as the Service does not currently process payments.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">3.</span> How we use your data
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>To create and manage your account</li>
                  <li>To calculate and display your typing statistics and personal progress dashboard</li>
                  <li>To display leaderboards (see Section 5 — this involves showing some of your data publicly)</li>
                  <li>To remember your settings and preferences</li>
                  <li>To operate, secure, and improve the Service</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">4.</span> What's public vs. private
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="p-3 bg-[#0F0E0D]/40 border border-[rgba(232,226,216,0.06)] rounded-xl space-y-1">
                    <span className="text-[#E85D3D] font-bold font-mono text-[10px] uppercase tracking-wider block">Public</span>
                    <p className="text-[11px]">
                      Visible to any visitor, logged in or not, via leaderboards: your username, profile photo, WPM, accuracy, test mode/difficulty/language, and the date of each qualifying result.
                    </p>
                  </div>
                  <div className="p-3 bg-[#0F0E0D]/40 border border-[rgba(232,226,216,0.06)] rounded-xl space-y-1">
                    <span className="text-[#6FA85C] font-bold font-mono text-[10px] uppercase tracking-wider block">Private</span>
                    <p className="text-[11px]">
                      Visible only to you: your email address, first/last name (unless you choose to make them visible elsewhere), and detailed test-by-test history beyond what appears on leaderboards.
                    </p>
                  </div>
                </div>
                <p className="mt-1 text-[11px]">
                  If you don't want your typing performance or profile photo visible to other users, don't create an account, or contact us to discuss options.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">5.</span> Third parties we share data with
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Supabase</strong>: authentication, database, and file storage, as described above.</li>
                  <li><strong>Google Sign-In (optional)</strong>: if you choose this sign-in method via Supabase's OAuth integration, Google provides us your basic account info per your Google account permissions.</li>
                </ul>
                <p>
                  We do not sell your personal data to third parties, and we do not use your data for advertising purposes.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">6.</span> Cookies and local storage
                </h3>
                <p>
                  We use browser local storage and session storage (not third-party advertising cookies) to remember settings like your chosen sound, caret speed, and language, particularly for guest (logged-out) users.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">7.</span> Children's privacy
                </h3>
                <p>
                  This Service is not directed at children under 13, and we do not knowingly collect personal data from children under 13.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">8.</span> Data retention and deletion
                </h3>
                <p>
                  You can delete your account at any time from account settings, which removes your account data and profile photo. Typing test results associated with your account are deleted along with it. If you'd like your data deleted and can't do so yourself, contact us at <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">9.</span> Your rights
                </h3>
                <p>
                  Depending on your location, you may have rights to access, correct, or delete your personal data, or to object to certain uses of it. You can exercise most of these directly through account settings, or by contacting us at <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a>.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">10.</span> Security
                </h3>
                <p>
                  We rely on Supabase's built-in security infrastructure (e.g. secure authentication, Row Level Security policies on the database) to protect your data. No system is perfectly secure, and we can't guarantee absolute security.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">11.</span> Changes to this policy
                </h3>
                <p>
                  We may update this Privacy Policy from time to time. We'll update the "last updated" date above when we do.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#E8E2D8] flex items-center gap-2">
                  <span className="text-[#E85D3D] font-mono">12.</span> Contact
                </h3>
                <p>
                  Questions about this Privacy Policy or your data: <br />
                  Telegram: <a href="https://t.me/Nodirbek_B" target="_blank" rel="noopener noreferrer" className="text-[#E85D3D] hover:underline font-mono">@Nodirbek_B</a> <br />
                  Email: <a href="mailto:baratovnodirbek0711@gmail.com" className="text-[#E85D3D] hover:underline">baratovnodirbek0711@gmail.com</a> <br />
                  Phone: <span className="text-[#E8E2D8] font-mono">+998 33 009 00 35</span>
                </p>
              </section>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
