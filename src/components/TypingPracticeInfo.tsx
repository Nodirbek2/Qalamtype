import React from 'react';
export function TypingPracticeInfo({ academy = false }: { academy?: boolean }) {
  return (
    <section lang="uz" className="mx-auto mt-10 w-full max-w-4xl space-y-3 text-sm text-[#A6B1C5]">
      <h2 className="text-lg font-semibold text-[#F0F3FA]">
        {academy ? 'Birinchi klaviatura mashqi' : 'Yozish tezligi va aniqligini o‘lchang'}
      </h2>
      {academy ? (
        <p>Ko‘rsatkich barmoqlaringizni F va J tugmalariga qo‘ying. Harf mashqlaridan boshlang, keyin so‘zlar, jumlalar va raqamlarga o‘ting. Natijangizni <a className="text-[#D6F36B] underline" href="/">tez yozish testida</a> tekshiring.</p>
      ) : (
        <>
          <p>O‘zbek lotin yoki kirill yozuvini tanlang va ekrandagi matnni yozishni boshlang. WPM bir daqiqadagi yozish tezligini, aniqlik esa to‘g‘ri yozilgan belgilar ulushini ko‘rsatadi.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[#D6F36B]">
            <a className="underline" href="/academy">Akademiya mashqlarini boshlash</a>
            <a className="underline" href="/blog/klaviaturada-tez-yozish">Klaviaturada tez yozish qo‘llanmasi</a>
          </div>
        </>
      )}
    </section>
  );
}
