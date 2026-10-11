import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PUBLIC_PAGES,SITE_ORIGIN} from '../src/lib/seo';
const config=JSON.parse(readFileSync('vercel.json','utf8'));
const sitemap=readFileSync('dist/sitemap.xml','utf8');
const titles=new Set<string>();
for(const page of PUBLIC_PAGES){
  const rewrite=config.rewrites.find((rule:{source:string})=>rule.source===page.path);
  assert.ok(rewrite,`Missing route: ${page.path}`);
  const html=readFileSync('dist'+rewrite.destination,'utf8');
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
  assert.ok(html.includes(`rel="canonical" href="${SITE_ORIGIN+page.path}"`));
  assert.ok(html.includes('content="index, follow"'));
  assert.ok(sitemap.includes(`<loc>${SITE_ORIGIN+page.path}</loc>`));
  assert.ok(!titles.has(page.title),'Duplicate title');titles.add(page.title);
  assert.ok(html.includes('<h1'),'No initial content');
  if(page.path.startsWith('/blog/')){
    const schema=html.match(/<script id="article-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(schema);assert.equal(JSON.parse(schema[1]).mainEntityOfPage,SITE_ORIGIN+page.path);
    assert.ok(html.includes('<article'),'Article missing without JavaScript');
  }
}
const account=readFileSync('dist/seo/account.html','utf8');assert.ok(account.includes('content="noindex, follow"'));assert.ok(!sitemap.includes('/account'));
console.log(`SEO checks passed: ${PUBLIC_PAGES.length} public routes, canonicals, sitemap, article schema and private account`);
