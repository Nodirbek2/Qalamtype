import React from 'react';
import { Keyboard, GraduationCap, Trophy, Info, Sparkles, Globe, ShieldCheck, Zap } from 'lucide-react';

interface AboutViewProps {
  onStartTest?: () => void;
  onGoAcademy?: () => void;
  onGoLeaderboard?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onStartTest,
  onGoAcademy,
  onGoLeaderboard,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 select-none font-sans">
      {/* Header Banner */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E85D3D]/10 border border-[#E85D3D]/20 text-[#E85D3D] text-xs font-mono mb-4">
          <Info className="w-3.5 h-3.5" />
          <span>Loyiha haqida</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#E8E2D8] tracking-tight mb-4">
          Qalampir — klaviaturada tez yozish platformasi
        </h1>
        <p className="text-base sm:text-lg text-[#9A9488] max-w-2xl mx-auto font-sans leading-relaxed">
          Matn terish tezligini oshirish, barmoqlar harakatini charxlash va o'z ko'rsatkichlaringizni kuzatib borish uchun mo'ljallangan zamonaviy va bepul xizmat.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* Section 1: Qalampir nima */}
        <div className="bg-[#1A1917] border border-[rgba(232,226,216,0.08)] rounded-2xl p-6 sm:p-8 hover:border-[rgba(232,226,216,0.15)] transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[#E85D3D]/10 text-[#E85D3D]">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#E8E2D8] font-mono">
              Qalampir nima va u kimlar uchun?
            </h2>
          </div>
          <p className="text-[#C4BEB4] text-sm sm:text-base leading-relaxed">
            Qalampir — bu klaviaturada terish tezligini oshirish va barmoqlar harakatini avtomatlashtirishga mo'ljallangan zamonaviy platformadir. Har kuni <strong className="text-[#E85D3D] font-medium">tez yozish mashqi</strong> bajarish orqali siz matnlarni xatosiz va bir necha barobar tezroq terishni o'rganasiz. Dasturchilar, kopirayterlar, talabalar va matn bilan ishlovchi barcha foydalanuvchilar uchun foydali vositadir.
          </p>
        </div>

        {/* Grid Section: Languages & Academy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 2: Multilingual support */}
          <div className="bg-[#1A1917] border border-[rgba(232,226,216,0.08)] rounded-2xl p-6 sm:p-8 hover:border-[rgba(232,226,216,0.15)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#6FA85C]/10 text-[#6FA85C]">
                  <Globe className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-[#E8E2D8] font-mono">
                  Ko'p tilli qo'llab-quvvatlash
                </h2>
              </div>
              <p className="text-[#C4BEB4] text-sm leading-relaxed mb-4">
                Platformamiz o'zbekcha (lotin va kirill), ruscha hamda ingliz tillarini to'liq qo'llab-quvvatlaydi. Har bir til uchun maxsus boyitilgan lug'atlar va matnlar to'plami mavjud. <strong className="text-[#E8E2D8] font-medium">Klaviaturada tez yozish</strong> ko'nikmasi nafaqat vaqtingizni tejaydi, balki ish unumdorligingizni sezilarli darajada oshiradi.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[rgba(232,226,216,0.06)] font-mono text-xs text-[#9A9488]">
              <span className="px-2.5 py-1 rounded-md bg-[#0F0E0D] border border-[rgba(232,226,216,0.08)]">O'zbekcha (Lotin)</span>
              <span className="px-2.5 py-1 rounded-md bg-[#0F0E0D] border border-[rgba(232,226,216,0.08)]">Ўзбекча (Кирилл)</span>
              <span className="px-2.5 py-1 rounded-md bg-[#0F0E0D] border border-[rgba(232,226,216,0.08)]">Русский</span>
              <span className="px-2.5 py-1 rounded-md bg-[#0F0E0D] border border-[rgba(232,226,216,0.08)]">English</span>
            </div>
          </div>

          {/* Section 3: Academy */}
          <div className="bg-[#1A1917] border border-[rgba(232,226,216,0.08)] rounded-2xl p-6 sm:p-8 hover:border-[rgba(232,226,216,0.15)] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 rounded-xl bg-[#E85D3D]/10 text-[#E85D3D]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold text-[#E8E2D8] font-mono">
                  Qalampir Akademiyasi
                </h2>
              </div>
              <p className="text-[#C4BEB4] text-sm leading-relaxed mb-4">
                Bosqichma-bosqich ta'lim tizimi orqali klaviaturadagi tugmalarni ko'rmasdan terishni o'rganing. Darslar alohida harflar va sodda so'zlardan boshlanib, tinish belgilari va murakkab adabiy matnlargacha davom etadi. Har bir dars natijasiga qarab yulduzlar taqdim etiladi.
              </p>
            </div>
            <div className="pt-2 border-t border-[rgba(232,226,216,0.06)]">
              <button
                type="button"
                onClick={onGoAcademy}
                className="text-xs font-mono text-[#E85D3D] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Akademiya darslariga o'tish &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Gamification & Leaderboard */}
        <div className="bg-[#1A1917] border border-[rgba(232,226,216,0.08)] rounded-2xl p-6 sm:p-8 hover:border-[rgba(232,226,216,0.15)] transition-all">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
              <Trophy className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#E8E2D8] font-mono">
              O'yin rejimlari va peshqadamlar jadvali
            </h2>
          </div>
          <p className="text-[#C4BEB4] text-sm sm:text-base leading-relaxed mb-4">
            Darslardan tashqari, vaqt (15, 30, 60, 120 soniya) hamda so'zlar soniga asoslangan rejimlar mavjud. Ular xuddi <strong className="text-[#E85D3D] font-medium">tez yozish o'yini</strong> singari doimiy ravishda o'z natijalaringizni yaxshilash va peshqadamlar jadvalida boshqa tezyozarlar bilan bellashish imkoniyatini beradi.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={onStartTest}
              className="px-5 py-2.5 rounded-xl bg-[#E85D3D] hover:bg-[#E85D3D]/90 text-[#0F0E0D] font-mono text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer shadow-lg shadow-[#E85D3D]/10"
            >
              <Keyboard className="w-4 h-4" />
              <span>Testni boshlash</span>
            </button>
            <button
              type="button"
              onClick={onGoLeaderboard}
              className="px-5 py-2.5 rounded-xl bg-[#0F0E0D] hover:bg-[rgba(232,226,216,0.05)] border border-[rgba(232,226,216,0.12)] text-[#E8E2D8] font-mono text-xs font-medium transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
              <span>Peshqadamlar jadvali</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
