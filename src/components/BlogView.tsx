import React, { useState } from 'react';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { ArrowLeft, BookOpen, Calendar, Clock, ChevronRight, Keyboard, ArrowRight } from 'lucide-react';

interface BlogViewProps {
  currentSlug?: string | null;
  onNavigateBlog: (slug?: string) => void;
  onNavigateHome: () => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  currentSlug,
  onNavigateBlog,
  onNavigateHome,
}) => {
  const activeArticle = currentSlug
    ? BLOG_ARTICLES.find((a) => a.slug === currentSlug)
    : null;

  // Render paragraph content with bold text and Qalamtype homepage link support
  const renderFormattedParagraph = (text: string) => {
    // Replace [Qalamtype](https://www.qalamtype.uz) or Qalamtype link references
    return text.split(/(\[(?:Qalamtype|Qalampir)\]\(https?:\/\/(?:www\.)?qalamtype\.uz\/?\))/g).map((part, index) =>
      /^\[/.test(part) ? <button key={index} type="button" onClick={onNavigateHome} className="text-[#D6F36B] hover:underline">Qalamtype</button> : <React.Fragment key={index}>{renderBoldText(part)}</React.Fragment>
    );
  };

  const renderBoldText = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }
      elements.push(
        <strong key={match.index} className="text-[#F0F3FA] font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements;
  };

  // Article detail view
  if (activeArticle) {
    return (
      <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 font-sans">
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[rgba(240,243,250,0.08)]">
          <button
            type="button"
            onClick={() => onNavigateBlog()}
            className="inline-flex items-center space-x-2 text-xs font-mono text-[#A6B1C5] hover:text-[#D6F36B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Barcha maqolalar</span>
          </button>

          <div className="flex items-center space-x-3 text-xs font-mono text-[#A6B1C5]">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#D6F36B]" />
              <span>{activeArticle.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-[#A6B1C5]" />
              <span>{activeArticle.readTime}</span>
            </span>
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D6F36B]/10 border border-[#D6F36B]/20 text-[#D6F36B] text-xs font-mono mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Qalamtype Blog</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#F0F3FA] tracking-tight leading-tight mb-4">
            {activeArticle.title}
          </h1>
          <p className="text-base sm:text-lg text-[#A6B1C5] font-sans leading-relaxed">
            {activeArticle.description}
          </p>
        </header>

        <BlogVisual kind={activeArticle.slug === 'tez-yozish-oyinlari' ? 'race' : 'keyboard'} />
        {/* Practice invitation */}
        <div className="my-8 p-5 sm:p-6 rounded-2xl bg-[#1E1C1A] border border-[#D6F36B]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 text-left w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#D6F36B]/15 border border-[#D6F36B]/30 flex items-center justify-center text-[#D6F36B] shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm sm:text-base font-semibold text-[#F0F3FA] font-sans">
                Boshlang‘ich natijangizni bilib oling
              </p>
              <p className="text-xs text-[#A6B1C5] font-sans">
                O'zbek, rus va ingliz tillarida bepul test va aniq statistika.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D6F36B] hover:bg-[#D6F36B]/90 active:scale-95 text-[#0D111A] font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer touch-manipulation"
          >
            <span>Endi test qilib ko‘ring</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Article Body */}
        <article className="space-y-8 text-[#C4BEB4] text-base leading-relaxed">
          {activeArticle.sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              {section.heading && (
                <h2 className="text-xl sm:text-2xl font-bold text-[#F0F3FA] font-mono pt-4 border-t border-[rgba(240,243,250,0.06)]">
                  {section.heading}
                </h2>
              )}

              {section.paragraphs?.map((p, pIdx) => (
                <p key={pIdx} className="text-[#C4BEB4] leading-relaxed text-sm sm:text-base">
                  {renderFormattedParagraph(p)}
                </p>
              ))}

              {section.listItems && section.listItems.length > 0 && (
                <ol className="list-decimal list-inside space-y-2.5 pl-2 text-sm sm:text-base text-[#C4BEB4]">
                  {section.listItems.map((item, lIdx) => (
                    <li key={lIdx} className="pl-1">
                      {renderFormattedParagraph(item)}
                    </li>
                  ))}
                </ol>
              )}
              {(idx === 0 || idx === 2 || idx === 4) && <BlogVisual kind={idx === 0 ? (activeArticle.slug === 'tez-yozish-oyinlari' ? 'race' : 'keyboard') : idx === 2 ? 'accuracy' : 'progress'} />}
              {(idx === 1 || idx === 4) && <div className="blog-practice"><div><strong>O‘qiganingizni amalda sinang</strong><p>{idx === 1 ? 'Shoshilmasdan yozing, barmoqlarni asosiy qatorga qaytaring.' : 'Natijadagi tezlik va aniqlikni kuzating. Keyingi mashqda xatolarni kamaytiring.'}</p></div><button type="button" onClick={onNavigateHome}>Endi test qilib ko‘ring <ArrowRight size={16}/></button></div>}
            </div>
          ))}
        </article>

        {/* Call to action banner at bottom of article */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#1E1C1A] border border-[#D6F36B]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4 text-left w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-[#D6F36B]/15 border border-[#D6F36B]/30 flex items-center justify-center text-[#D6F36B] shrink-0 mt-0.5 sm:mt-0">
              <Keyboard className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#F0F3FA] font-mono">
                Tez yozish trenajyoriga o'tish
              </h3>
              <p className="text-xs sm:text-sm text-[#A6B1C5] font-sans">
                Qalamtype bilan o'zbek, rus va ingliz tillarida bepul tez yozish mashqini boshlang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D6F36B] hover:bg-[#D6F36B]/90 active:scale-95 text-[#0D111A] font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer touch-manipulation shadow-sm"
          >
            <span>Endi test qilib ko‘ring</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Blog Index View (/blog)
  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 font-sans">
      {/* Index Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D6F36B]/10 border border-[#D6F36B]/20 text-[#D6F36B] text-xs font-mono mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Foydali Maqolalar</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#F0F3FA] tracking-tight mb-4">
          Qalamtype Blog
        </h1>
        <p className="text-base sm:text-lg text-[#A6B1C5] max-w-2xl mx-auto leading-relaxed">
          Klaviaturada tez yozish, samarali mashqlar, tugmalarni to'g'ri bosish va matn terish o'yinlari haqidagi eng sara qo'llanmalar.
        </p>
      </div>

      {/* Articles List */}
      <div className="grid gap-6">
        {BLOG_ARTICLES.map((article) => (
          <a
            href={`/blog/${article.slug}`}
            key={article.slug}
            onClick={(event) => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onNavigateBlog(article.slug); } }}
            className="group bg-[#171E2B] border border-[rgba(240,243,250,0.08)] rounded-2xl p-6 sm:p-8 text-left hover:border-[#D6F36B]/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <BlogVisual kind={article.slug === 'tez-yozish-oyinlari' ? 'race' : article.slug === 'eng-yaxshi-mashqlar' ? 'progress' : 'keyboard'} compact />
            <div>
              <div className="flex items-center space-x-3 text-xs font-mono text-[#A6B1C5] mb-3">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#D6F36B]" />
                  <span>{article.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readTime}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#F0F3FA] group-hover:text-[#D6F36B] transition-colors mb-3 font-mono">
                {article.title}
              </h2>

              <p className="text-sm sm:text-base text-[#A6B1C5] leading-relaxed mb-4">
                {article.description}
              </p>
            </div>

            <div className="flex items-center text-xs font-mono text-[#D6F36B] font-medium pt-2 border-t border-[rgba(240,243,250,0.06)] group-hover:translate-x-1 transition-transform w-fit">
              <span>Batafsil o'qish</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

type VisualKind = 'keyboard' | 'accuracy' | 'progress' | 'race';
function BlogVisual({kind, compact = false}: {kind: VisualKind; compact?: boolean}) {
  const [paused, setPaused] = useState(false);
  const titles = {keyboard:'Barmoqlarning boshlang‘ich joyi',accuracy:'Avval aniqlik, keyin tezlik',progress:'Harflardan ravon matngacha',race:'Yozish ritmi — poyga harakati'};
  const captions = {keyboard:'Lotin QWERTY: F va J — ko‘rsatkich barmoqlar. Bosh barmoq — Space. Tugmadan keyin asosiy qatorga qayting.',accuracy:'Xato belgini sezsangiz, shoshilmang. Tezlikni biroz pasaytirib, to‘g‘ri yozishni mashq qiling.',progress:'Birinchi sodda birikmalar, so‘ng so‘zlar, jumlalar va belgilar. Bir bosqichni o‘zlashtirgach, keyingisiga o‘ting.',race:'Bu tushuntiruvchi animatsiya. Har bir to‘g‘ri yozilgan qism oldinga siljishga yordam beradi; natijani aniqlik bilan birga baholang.'};
  return <figure className={`blog-visual ${compact ? 'blog-visual-compact' : ''} ${paused ? 'blog-paused' : ''}`}>
    <div className="blog-visual-top"><span>{titles[kind]}</span>{!compact && <button type="button" onClick={()=>setPaused(!paused)} aria-label={paused ? 'Animatsiyani davom ettirish' : 'Animatsiyani to‘xtatish'}>{paused ? 'Davom ettirish' : 'Pauza'}</button>}</div>
    <svg viewBox="0 0 640 240" role="img" aria-label={titles[kind]}>
      {kind === 'keyboard' && <>
        {['QWERTYUIOP','ASDFGHJKL;','ZXCVBNM,. /'.replace(' ','')].map((row,r)=>[...row].map((key,c)=> {
          const home=r===1; const anchor=key==='F'||key==='J';
          return <g key={`${r}-${c}`} transform={`translate(${40+c*54+r*14},${22+r*53})`}><rect width="47" height="43" rx="9" fill={anchor?'#D6F36B':home?'#263b43':'#202936'} stroke={home?'#70b8a6':'#435063'}/><text x="23" y="27" textAnchor="middle" fill={anchor?'#101820':'#eef3fa'} fontSize="18">{key}</text>{anchor && <path d="M17 35h12" stroke="#101820" strokeWidth="3"/>}</g>;
        }))}
        <rect x="190" y="185" width="265" height="36" rx="9" fill="#263b43" stroke="#70b8a6"/><text x="322" y="208" textAnchor="middle" fill="#eef3fa" fontSize="15">Space · bosh barmoq</text>
        <circle className="blog-key-pulse" cx="239" cy="75" r="10" fill="#8ed8ff"/><circle className="blog-key-pulse" cx="401" cy="75" r="10" fill="#8ed8ff"/>
      </>}
      {kind === 'accuracy' && <>
        <text x="40" y="58" fill="#a6b1c5" fontSize="16">Shoshilish o‘rniga, to‘g‘ri harfni tanlang</text>
        <text x="40" y="126" fill="#D6F36B" fontSize="44" fontFamily="monospace">salo</text><text x="146" y="126" fill="#ff9c9c" fontSize="44" fontFamily="monospace" className="blog-error-letter">n</text><text x="146" y="126" fill="#D6F36B" fontSize="44" fontFamily="monospace" className="blog-correct-letter">m</text>
        <path d="M40 165h550" stroke="#344154" strokeWidth="10" strokeLinecap="round"/><path className="blog-accuracy-line" d="M40 165h500" stroke="#D6F36B" strokeWidth="10" strokeLinecap="round"/>
        <text x="40" y="210" fill="#eef3fa" fontSize="18">Sekinroq → kamroq xato → barqaror ritm</text>
      </>}
      {kind === 'progress' && <>
        {['f j','salom','Bugun mashq.','2026!'].map((label,i)=><g key={label} transform={`translate(${28+i*154},${120-i*23})`}><rect className="blog-step" style={{animationDelay:`${i*.5}s`}} width="128" height="76" rx="16" fill="#263b43" stroke="#70b8a6"/><text x="64" y="33" textAnchor="middle" fill="#D6F36B" fontSize={i===2?'14':'21'}>{label}</text><text x="64" y="58" textAnchor="middle" fill="#a6b1c5" fontSize="12">{['Harflar','So‘zlar','Jumlalar','Belgilar'][i]}</text></g>)}
      </>}
      {kind === 'race' && <>
        {[70,145].map((y,i)=><g key={y}><rect x="30" y={y} width="575" height="49" rx="14" fill="#202936"/><path d={`M45 ${y+25}h545`} stroke="#526175" strokeDasharray="12 12"/><g className={`blog-racer blog-racer-${i}`}><rect x="48" y={y+9} width="67" height="30" rx="10" fill={i===0?'#D6F36B':'#8ed8ff'}/><circle cx="62" cy={y+39} r="6" fill="#0d111a"/><circle cx="98" cy={y+39} r="6" fill="#0d111a"/></g><path d={`M580 ${y+5}v39`} stroke="#eef3fa" strokeWidth="3"/></g>)}
        <text x="32" y="35" fill="#a6b1c5" fontSize="16">Bir maromda yozing. Xatolarni ham kuzating.</text>
        <text x="32" y="223" fill="#eef3fa" fontSize="16">Namuna animatsiyasi · haqiqiy natijalar emas</text>
      </>}
    </svg>
    {!compact && <figcaption>{captions[kind]}</figcaption>}
  </figure>;
}
