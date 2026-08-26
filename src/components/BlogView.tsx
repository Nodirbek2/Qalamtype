import React, { useEffect } from 'react';
import { BLOG_ARTICLES, BlogArticle } from '../data/blogArticles';
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

  // Set document title dynamically according to SEO requirements
  useEffect(() => {
    if (activeArticle) {
      document.title = activeArticle.title;
    } else {
      document.title = "Qalampir Blog — tez yozish va klaviatura bo'yicha maqolalar";
    }

    return () => {
      document.title = "Qalampir — tez yozish mashqi va testi (UZ/RU/EN)";
    };
  }, [activeArticle]);

  // Render paragraph content with bold text and Qalampir homepage link support
  const renderFormattedParagraph = (text: string) => {
    // Replace [Qalampir](https://www.qalamtype.uz) or Qalampir link references
    const linkRegex = /\[Qalampir\]\(https?:\/\/(?:www\.)?qalamtype\.uz\/?\)/g;

    // Split text into segments
    const parts = text.split(linkRegex);
    const hasLink = linkRegex.test(text);

    if (!hasLink) {
      // Process bold markers like **bold**
      return renderBoldText(text);
    }

    return (
      <>
        {renderBoldText(parts[0])}
        <button
          type="button"
          onClick={onNavigateHome}
          className="text-[#E85D3D] hover:underline font-medium inline-flex items-center cursor-pointer"
        >
          Qalampir
        </button>
        {parts[1] && renderBoldText(parts[1])}
      </>
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
        <strong key={match.index} className="text-[#E8E2D8] font-semibold">
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
      <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 font-sans select-none">
        {/* Navigation bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[rgba(232,226,216,0.08)]">
          <button
            type="button"
            onClick={() => onNavigateBlog()}
            className="inline-flex items-center space-x-2 text-xs font-mono text-[#9A9488] hover:text-[#E85D3D] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Barcha maqolalar</span>
          </button>

          <div className="flex items-center space-x-3 text-xs font-mono text-[#9A9488]">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#E85D3D]" />
              <span>{activeArticle.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-[#9A9488]" />
              <span>{activeArticle.readTime}</span>
            </span>
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E85D3D]/10 border border-[#E85D3D]/20 text-[#E85D3D] text-xs font-mono mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Qalampir Blog</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-[#E8E2D8] tracking-tight leading-tight mb-4">
            {activeArticle.title}
          </h1>
          <p className="text-base sm:text-lg text-[#9A9488] font-sans leading-relaxed">
            {activeArticle.description}
          </p>
        </header>

        {/* Mid-article CTA Card (Before section 1) */}
        <div className="my-8 p-5 sm:p-6 rounded-2xl bg-[#1E1C1A] border border-[#E85D3D]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 text-left w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-[#E85D3D]/15 border border-[#E85D3D]/30 flex items-center justify-center text-[#E85D3D] shrink-0">
              <Keyboard className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm sm:text-base font-semibold text-[#E8E2D8] font-sans">
                Nazariyani bilib oldingizmi? Hoziroq tezligingizni amalda sinab ko'ring!
              </p>
              <p className="text-xs text-[#9A9488] font-sans">
                O'zbek, rus va ingliz tillarida bepul test va aniq statistika.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#E85D3D] hover:bg-[#E85D3D]/90 active:scale-95 text-[#0F0E0D] font-mono text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer touch-manipulation"
          >
            <span>Klaviaturada yozishni boshlash</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Article Body */}
        <article className="space-y-8 text-[#C4BEB4] text-base leading-relaxed">
          {activeArticle.sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              {section.heading && (
                <h2 className="text-xl sm:text-2xl font-bold text-[#E8E2D8] font-mono pt-4 border-t border-[rgba(232,226,216,0.06)]">
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
            </div>
          ))}
        </article>

        {/* Call to action banner at bottom of article */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-[#1E1C1A] border border-[#E85D3D]/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4 text-left w-full sm:w-auto">
            <div className="w-12 h-12 rounded-xl bg-[#E85D3D]/15 border border-[#E85D3D]/30 flex items-center justify-center text-[#E85D3D] shrink-0 mt-0.5 sm:mt-0">
              <Keyboard className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-[#E8E2D8] font-mono">
                Tez yozish trenajyoriga o'tish
              </h3>
              <p className="text-xs sm:text-sm text-[#9A9488] font-sans">
                Qalampir bilan o'zbek, rus va ingliz tillarida bepul tez yozish mashqini boshlang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E85D3D] hover:bg-[#E85D3D]/90 active:scale-95 text-[#0F0E0D] font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer touch-manipulation shadow-sm"
          >
            <span>Klaviaturada yozishni boshlash</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Blog Index View (/blog)
  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-10 px-4 font-sans select-none">
      {/* Index Header */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E85D3D]/10 border border-[#E85D3D]/20 text-[#E85D3D] text-xs font-mono mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Foydali Maqolalar</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-[#E8E2D8] tracking-tight mb-4">
          Qalampir Blog
        </h1>
        <p className="text-base sm:text-lg text-[#9A9488] max-w-2xl mx-auto leading-relaxed">
          Klaviaturada tez yozish, samarali mashqlar, tugmalarni to'g'ri bosish va matn terish o'yinlari haqidagi eng sara qo'llanmalar.
        </p>
      </div>

      {/* Articles List */}
      <div className="space-y-6">
        {BLOG_ARTICLES.map((article) => (
          <div
            key={article.slug}
            onClick={() => onNavigateBlog(article.slug)}
            className="group bg-[#1A1917] border border-[rgba(232,226,216,0.08)] rounded-2xl p-6 sm:p-8 hover:border-[#E85D3D]/40 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center space-x-3 text-xs font-mono text-[#9A9488] mb-3">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E85D3D]" />
                  <span>{article.date}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.readTime}</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#E8E2D8] group-hover:text-[#E85D3D] transition-colors mb-3 font-mono">
                {article.title}
              </h2>

              <p className="text-sm sm:text-base text-[#9A9488] leading-relaxed mb-4">
                {article.description}
              </p>
            </div>

            <div className="flex items-center text-xs font-mono text-[#E85D3D] font-medium pt-2 border-t border-[rgba(232,226,216,0.06)] group-hover:translate-x-1 transition-transform w-fit">
              <span>Batafsil o'qish</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
