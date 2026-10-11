import { BLOG_ARTICLES } from '../data/blogArticles';
export const SITE_ORIGIN = 'https://www.qalamtype.uz';
const BLOG_META: Record<string,{title:string;description:string}> = {
  'klaviaturada-tez-yozish':{title:'Klaviaturada tez yozishni o‘rganish — Qalamtype',description:'F va J dan boshlang, barmoqlarni to‘g‘ri joylashtiring va aniqlikni oshiring. Animatsiyali qo‘llanma bilan yozishni o‘rganing va testni sinang.'},
  'eng-yaxshi-mashqlar':{title:'Samarali tez yozish mashqlari — Qalamtype',description:'Asosiy qator, qisqa so‘zlar, vaqtli testlar va qiyin tugmalar uchun mashqlar. Qalamtype qo‘llanmasi bilan yozish tezligi va aniqligini mashq qiling.'},
  'tez-yozish-oyinlari':{title:'Tez yozish o‘yinlari haqida qo‘llanma — Qalamtype',description:'Poyga, vaqtli test va bosqichli darslar qanday yordam beradi? O‘zbekcha qo‘llanmani o‘qing, Qalamtype’da yozish tezligi va aniqligini sinang.'},
};
export const PUBLIC_PAGES = [
  {path:'/', title:'Qalamtype — tez yozish testi va klaviatura mashqlari', description:'O‘zbek, rus va ingliz tilida yozish tezligi va aniqligini sinang. Qalamtype’da bepul typing test, Akademiya darslari va yozish o‘yinlari.'},
  {path:'/academy', title:'Klaviaturada yozishni o‘rganish — Qalamtype Akademiya', description:'Harflar va sodda birikmalardan boshlang. Qalamtype Akademiyada barmoqlar joylashuvi, raqamlar, so‘zlar va jumlalarni bosqichma-bosqich mashq qiling.'},
  {path:'/games', title:'Tez yozish o‘yinlari — Qalamtype', description:'Qalamtype yozish o‘yinlarida tezlik va aniqlikni mashq qiling. Poyga va boshqa o‘yinlar orqali klaviaturada yozishni qiziqarli tarzda sinang.'},
  {path:'/leaderboard', title:'Tez yozish reytingi — Qalamtype peshqadamlari', description:'Qalamtype peshqadamlar jadvalidagi yozish natijalarini ko‘ring. O‘z tezlik va aniqligingizni mashq qilib yaxshilang.'},
  {path:'/about', title:'Qalamtype haqida — o‘zbekcha tez yozish platformasi', description:'Qalamtype — klaviaturada yozishni mashq qilish platformasi. O‘zbek lotin va kirill, rus hamda ingliz tillarida test, darslar va o‘yinlar.'},
  {path:'/blog', title:'Tez yozish qo‘llanmalari — Qalamtype Blog', description:'Barmoqlarni joylashtirish, aniqlikni oshirish va samarali mashq qilish haqida o‘zbekcha qo‘llanmalar. Animatsiyalar yordamida o‘rganing va testni sinang.'},
  ...BLOG_ARTICLES.map(article=>({path:`/blog/${article.slug}`,...BLOG_META[article.slug]})),
];
export function getPageSeo(path:string) {
  const normalized=path==='/'?'/':path.replace(/\/+$/,'');
  return PUBLIC_PAGES.find(page=>page.path===normalized) ?? {path:normalized,title:'Shaxsiy hisob — Qalamtype',description:'Qalamtype shaxsiy profilingiz va natijalaringiz.',noindex:true};
}
export function applyPageSeo(path:string) {
  const page=getPageSeo(path);
  document.title=page.title;
  function meta(selector:string, value:string, attribute:'name'|'property', key:string) {
    let element=document.querySelector<HTMLMetaElement>(selector);
    if(!element){element=document.createElement('meta');element.setAttribute(attribute,key);document.head.appendChild(element);}
    element.content=value;
  }
  meta('meta[name="description"]',page.description,'name','description');
  meta('meta[name="robots"]','noindex' in page?'noindex, follow':'index, follow','name','robots');
  for(const [key,value] of Object.entries({'og:title':page.title,'og:description':page.description,'og:url':SITE_ORIGIN+page.path,'og:type':page.path.startsWith('/blog/')?'article':'website'}))meta(`meta[property="${key}"]`,value,'property',key);
  meta('meta[name="twitter:title"]',page.title,'name','twitter:title');
  meta('meta[name="twitter:description"]',page.description,'name','twitter:description');
  let canonical=document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical);}
  canonical.href=SITE_ORIGIN+page.path;
  document.getElementById('article-schema')?.remove();
  const article=BLOG_ARTICLES.find(article=>`/blog/${article.slug}`===page.path);
  if(article){const schema=document.createElement('script');schema.id='article-schema';schema.type='application/ld+json';schema.textContent=JSON.stringify(articleSchema(article));document.head.appendChild(schema);}
}
export function articleSchema(article:typeof BLOG_ARTICLES[number]) {
  return {'@context':'https://schema.org','@type':'Article',headline:article.title,description:article.description,inLanguage:'uz',datePublished:article.date,dateModified:'2026-10-11',mainEntityOfPage:SITE_ORIGIN+'/blog/'+article.slug,image:SITE_ORIGIN+'/og-image.png',author:{'@type':'Organization',name:'Qalamtype',url:SITE_ORIGIN,logo:SITE_ORIGIN+'/android-chrome-512x512.png'},publisher:{'@type':'Organization',name:'Qalamtype',logo:{'@type':'ImageObject',url:SITE_ORIGIN+'/android-chrome-512x512.png'}}};
}
