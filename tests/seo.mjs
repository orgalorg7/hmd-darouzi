import {readFile,stat} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {parseHTML} from 'linkedom';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {routes,renderFaqPage,renderHome,renderPrivacyPage,renderServicePage,siteOrigin,sitemap} from '../scripts/seo/render.js';
import {faqPath,homePath,privacyPath,servicePath} from '../src/site-meta.js';
const origin='https://www.example.com',template=await readFile('index.html','utf8');
expect(siteOrigin(origin+'/')).toBe(origin);
for(const invalid of ['http://example.com','https://example.com/path','https://example.com/?x=1','https://abc.trycloudflare.com','https://abc.pages.dev','https://user:secret@example.com','https://localhost'])expect(()=>siteOrigin(invalid)).toThrow();
const titles=new Set(),descriptions=new Set();
for(const route of routes){
 const html=route.service?renderServicePage({...route,origin}):route.privacy?renderPrivacyPage({...route,origin}):route.faq?renderFaqPage({...route,origin}):renderHome(template,{...route,origin});const{document:d}=parseHTML(html);
 const title=d.querySelector('title').textContent,description=d.querySelector('meta[name=description]').content;titles.add(title);descriptions.add(description);
 expect(d.documentElement.lang).toBe(route.lang);expect(d.documentElement.dir).toBe(route.lang==='ar'?'rtl':'ltr');expect(d.querySelectorAll('h1').length).toBe(1);
 expect(d.querySelector('link[rel=canonical]').href).toBe(origin+route.path);
 for(const lang of ['ar','en','x-default']){const l=lang==='x-default'?'ar':lang;expect(d.querySelector(`link[hreflang="${lang}"]`).href).toBe(origin+(route.service?servicePath(route.service.id,l):route.privacy?privacyPath(l):route.faq?faqPath(l):homePath(l)));}
 expect(d.querySelector('meta[name=robots]').content).toContain('index, follow');expect(d.querySelector('meta[name=robots]').content).not.toContain('noindex');
 expect(d.querySelector('meta[property="og:url"]').content).toBe(origin+route.path);expect(d.querySelector('meta[property="og:title"]').content).toBe(title);
 const graph=JSON.parse(d.querySelector('#site-schema').textContent)['@graph'];const business=graph.find(n=>n['@type']==='LocalBusiness');expect(business.alternateName).toContain('درعوزي');expect(business.telephone).toBe('+963944699555');expect(business.address.addressCountry).toBe('SY');expect(business).not.toHaveProperty('aggregateRating');expect(business.sameAs).toEqual(expect.arrayContaining(['https://www.instagram.com/hmd.darouzi_for_cooling/','https://www.facebook.com/profile.php?id=61586906683380']));for(const a of d.querySelectorAll('a[href^="https://wa.me/"]'))expect(a.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/971506497817\?text=/);
 expect(graph.find(n=>n['@type']==='WebPage').url).toBe(origin+route.path);
 if(route.service){expect(graph.find(n=>n['@type']==='Service').provider['@id']).toBe(business['@id']);expect(d.querySelectorAll('script:not([type="application/ld+json"])').length).toBe(0);expect(gzipSync(html).length).toBeLessThan(9000);}
 else if(route.faq){expect(d.querySelectorAll('script:not([type="application/ld+json"])').length).toBe(0);const faq=graph.find(n=>n['@type']==='FAQPage');expect(faq.mainEntity.length).toBe(10);expect(d.querySelectorAll('.policy section h2').length).toBe(10);for(const q of faq.mainEntity)expect(html).toContain(q.name);expect(d.querySelector(`a[href="${faqPath(route.lang==='ar'?'en':'ar')}"]`)).not.toBeNull();}
 else if(route.privacy){expect(d.querySelectorAll('script:not([type="application/ld+json"])').length).toBe(0);expect(d.querySelectorAll('.policy section').length).toBeGreaterThanOrEqual(7);expect(d.querySelector('time').getAttribute('datetime')).toMatch(/^\d{4}-\d{2}-\d{2}$/);expect(d.querySelector(`a[href="${privacyPath(route.lang==='ar'?'en':'ar')}"]`)).not.toBeNull();expect(graph.find(n=>n['@type']==='BreadcrumbList').itemListElement[1].item).toBe(origin+route.path);}
 else {expect(d.querySelector('.footer-privacy').getAttribute('href')).toBe(privacyPath(route.lang));expect(d.querySelector('.footer-faq').getAttribute('href')).toBe(faqPath(route.lang));expect(d.querySelectorAll('#repair-form input[name=problem]').length).toBe(7);expect(d.querySelector('.contact-channel-link').getAttribute('href')).toMatch(/^https:\/\/whatsapp\.com\/channel\//);expect(d.querySelectorAll('#projects .case').length).toBe(4);expect(d.querySelectorAll('#projects [data-photo]').length).toBe(11);for(const img of d.querySelectorAll('#projects .case-image'))expect(img.getAttribute('alt').length).toBeGreaterThan(8);for(const label of d.querySelectorAll('#projects [data-photo]'))expect(label.textContent.trim().length).toBeGreaterThan(8);expect(d.querySelector('#projects h3').textContent).toMatch(/4,?800/);expect(d.querySelector('#project-viewer')).not.toBeNull();expect(d.querySelector('a[href="#projects"]')).not.toBeNull();expect(d.querySelector('#contact-whatsapp').getAttribute('href')).toMatch(/^https:\/\/wa\.me\/971506497817\?text=/);expect(d.querySelectorAll('.product-card').length).toBe(8);expect(d.querySelectorAll('.solution-tab').length).toBe(6);expect(d.querySelectorAll('.service-directory a').length).toBe(6);expect(d.querySelector('#service-desc').textContent.length).toBeGreaterThan(50);}
 for(const a of d.querySelectorAll('a[href^="/services/"],a[href^="/en/services/"]'))expect(routes.some(r=>r.path===a.href)).toBe(true);
 for(const img of d.querySelectorAll('img')){expect(img.hasAttribute('alt')).toBe(true);if(img.getAttribute('src'))await stat('public'+img.getAttribute('src'));}
 const actual=await readFile(`dist${route.path}index.html`,'utf8');const ad=parseHTML(actual).document;
 expect(ad.documentElement.lang).toBe(route.lang);expect(ad.querySelector('title').textContent).toBe(title);
 if(!process.env.SITE_URL){expect(ad.querySelector('meta[name=robots]').content).toContain('noindex');expect(ad.querySelector('link[rel=canonical]')).toBeNull();}
}
expect(titles.size).toBe(18);expect(descriptions.size).toBe(18);
const xml=parseHTML(sitemap(origin)).document;expect(xml.querySelectorAll('url').length).toBe(18);expect(xml.querySelectorAll('xhtml\\:link').length).toBe(54);
const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox']});const base=process.env.TEST_URL||'http://localhost:4173';
try{
 const plain=await browser.newContext({javaScriptEnabled:false});const page=await plain.newPage();
 for(const path of ['/','/en/','/services/cold-rooms/','/en/services/water-chillers/','/privacy/','/en/privacy/','/faq/','/en/faq/']){await page.goto(base+path);await expect(page.locator('h1')).toBeVisible();if(path.includes('privacy'))await expect(page.locator('.policy section')).toHaveCount(8);else if(path.includes('faq'))await expect(page.locator('.policy section')).toHaveCount(11);else if(!path.includes('services')){await expect(page.locator('.product-card')).toHaveCount(8);await expect(page.locator('#service-desc')).not.toBeEmpty();}else await expect(page.locator('a[href^="https://wa.me/"]')).toBeVisible();}
 await plain.close();
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/en/');await expect(p.locator('html')).toHaveAttribute('lang','en');await p.locator('#language').tap();await expect(p).toHaveURL(base+'/');await expect(p.locator('html')).toHaveAttribute('lang','ar');await p.reload();await expect(p.locator('html')).toHaveAttribute('lang','ar');await p.goBack();await expect(p.locator('html')).toHaveAttribute('lang','en');
 await p.locator('#catalog-search').fill('compressor');await p.locator('#language').tap();await expect(p.locator('#catalog-search')).toHaveValue('compressor');await expect(p.locator('.product-card')).toHaveCount(1);
 for(const lang of ['ar','en']){
  await p.goto(base+servicePath('cold',lang));const axe=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  for(const width of [320,390,1440]){await p.setViewportSize({width,height:900});expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 }
 const missing=await p.goto(base+'/this-page-does-not-exist/',{waitUntil:'domcontentloaded'});expect(missing.status()).toBe(404);expect((await context.request.get(base+'/missing-route-without-accept-header')).status()).toBe(404);await expect(p.locator('meta[name=robots]')).toHaveAttribute('content',/noindex/);
 expect(errors).toEqual([]);console.log('PASS: 18 static bilingual pages (including FAQ and privacy notice), unique metadata, reciprocal language URLs, canonical/schema/sitemap consistency, preview noindex, genuine 404, no-JS catalog/content, state-preserving language URLs and history, service accessibility, mobile layouts and zero service-page JavaScript.');
}finally{await browser.close();}
