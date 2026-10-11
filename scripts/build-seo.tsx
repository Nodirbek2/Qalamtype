import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {BLOG_ARTICLES} from '../src/data/blogArticles';
import {BlogView} from '../src/components/BlogView';
import {PUBLIC_PAGES,SITE_ORIGIN,articleSchema,getPageSeo} from '../src/lib/seo';
const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const template=readFileSync('dist/index.html','utf8');
const stylesheet=readdirSync('dist/assets').find(name=>name.startsWith('bootstrap-')&&name.endsWith('.css'));
if(!stylesheet)throw new Error('App stylesheet missing');
const navigation=<nav aria-label="Sayt bo‘limlari" className="flex flex-wrap justify-center gap-4 p-6 text-[#D6F36B]">{PUBLIC_PAGES.filter(page=>!page.path.startsWith('/blog/')).map(page=><a key={page.path} href={page.path}>{page.path==='/'?'Yozish testi':page.title.split(' — ')[0]}</a>)}</nav>;
const routes=[...PUBLIC_PAGES,getPageSeo('/account')];
mkdirSync('dist/seo',{recursive:true});
for(const page of routes){
  let html=template.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(page.title)}</title>`).replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/,`$1${escape(page.description)}$2`).replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/,`$1${SITE_ORIGIN+page.path}$2`);
  for(const [key,value] of Object.entries({'og:title':page.title,'og:description':page.description,'og:url':SITE_ORIGIN+page.path,'og:type':page.path.startsWith('/blog/')?'article':'website'}))html=html.replace(new RegExp(`(<meta property="${key}" content=")[^"]*("\\s*\\/?>)`),`$1${escape(value)}$2`);
  for(const [key,value] of Object.entries({'twitter:title':page.title,'twitter:description':page.description}))html=html.replace(new RegExp(`(<meta name="${key}" content=")[^"]*("\\s*\\/?>)`),`$1${escape(value)}$2`);
  const article=BLOG_ARTICLES.find(article=>'/blog/'+article.slug===page.path);
  html=html.replace('</head>',`<meta name="robots" content="${'noindex' in page?'noindex, follow':'index, follow'}"/><link rel="stylesheet" href="/assets/${stylesheet}"/>${article?`<script id="article-schema" type="application/ld+json">${JSON.stringify(articleSchema(article)).replace(/</g,'\\u003c')}</script>`:''}</head>`);
  const content=page.path.startsWith('/blog')?<BlogView currentSlug={article?.slug} onNavigateBlog={()=>{}} onNavigateHome={()=>{}}/>:<main className="max-w-4xl mx-auto p-8 text-[#F0F3FA]"><h1 className="text-3xl font-bold mb-5">{page.title}</h1><p className="text-[#A6B1C5]">{page.description}</p><p className="mt-6">Interaktiv mashqlar yuklanmoqda. JavaScript’ni yoqing va yozishni boshlang.</p></main>;
  html=html.replace('<div id="root"></div>',`<div id="root">${renderToStaticMarkup(<>{navigation}{page.path==='/blog/klaviaturada-tez-yozish' && <section id="article-typing-test" className="max-w-4xl mx-auto p-8 text-center text-[#F0F3FA]"><h2 className="text-3xl font-bold mb-3">Tez yozishni hoziroq sinab ko‘ring</h2><p>Matnni yozishni boshlang — taymer birinchi harfdan ishlaydi. Qo‘llanma test ostida.</p><p className="mt-5 text-[#A6B1C5]">Interaktiv test yuklanmoqda. JavaScript yoqilganda shu yerda yozishingiz mumkin.</p><a href="/" className="text-[#D6F36B]">Asosiy yozish testiga o‘tish</a></section>}{content}</>)}</div>`);
  const name=page.path==='/'?'home':page.path.slice(1).replaceAll('/','--');
  writeFileSync(`dist/seo/${name}.html`,html);
  if(page.path==='/')writeFileSync('dist/index.html',html);
}
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PUBLIC_PAGES.map(page=>`  <url><loc>${SITE_ORIGIN+page.path}</loc><lastmod>2026-10-11</lastmod></url>`).join('\n')}\n</urlset>\n`;
writeFileSync('dist/sitemap.xml',sitemap);
console.log(`Generated ${routes.length} HTML pages and ${PUBLIC_PAGES.length} sitemap URLs`);
