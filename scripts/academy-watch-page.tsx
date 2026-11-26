import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { academyVideo } from '../src/data/academyVideo';
import { SITE_ORIGIN } from '../src/lib/seo';

export function renderAcademyWatchPage(stylesheet: string) {
  const { path, title, description, source, poster, uploadDate, duration } = academyVideo;
  const url = SITE_ORIGIN + path;
  const thumbnailUrl = SITE_ORIGIN + poster;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl,
    uploadDate,
    duration,
    contentUrl: SITE_ORIGIN + source,
    inLanguage: 'uz',
    mainEntityOfPage: url,
  };

  return '<!doctype html>' + renderToStaticMarkup(
    <html lang="uz">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`${title} — QalamType`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href={`/assets/${stylesheet}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:type" content="video.other" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
        }} />
      </head>
      <body className="min-h-screen bg-[#0D111A] text-[#F0F3FA] font-sans">
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
          <a href="/academy" className="inline-flex min-h-11 items-center text-sm text-[#D6F36B] hover:underline">← QalamType Akademiya</a>
          <h1 className="mt-3 mb-4 text-2xl font-bold sm:text-4xl">{title}</h1>
          <video controls playsInline preload="metadata" poster={poster}
            aria-label={title} className="block aspect-video w-full rounded-xl bg-black">
            <source src={source} type="video/mp4" />
            <a href={source}>Videoni ochish</a>
          </video>
          <p className="mt-4 text-[#A6B1C5]">{description}</p>
          <a href="/academy" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#D6F36B] px-4 font-semibold text-[#0D111A]">Akademiyada mashq qilish →</a>
        </main>
      </body>
    </html>,
  );
}
