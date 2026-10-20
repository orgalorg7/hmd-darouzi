import {readFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import {blockedCrawlers,documentPolicy,headersFile,profilePath,securityHeaders,sitePolicy} from '../scripts/seo/security.js';
const base=process.env.TEST_URL||'http://localhost:4173';
// Static policy: no inline code, eval, wildcards or third-party origins, and every page refuses framing.
for(const policy of [sitePolicy,documentPolicy]){for(const unsafe of ["'unsafe-inline'","'unsafe-eval'",'*','http:','https:','data:','blob:'])expect(policy.split(/[\s;]+/)).not.toContain(unsafe);for(const directive of ["default-src 'none'","frame-ancestors 'none'","base-uri 'none'","form-action 'none'"])expect(policy).toContain(directive);}
expect(documentPolicy).not.toContain('script-src');
const preview=await readFile('dist/_headers','utf8');
if(!process.env.SITE_URL){expect(preview).toContain('X-Robots-Tag: noindex, follow');expect(preview).not.toContain('Strict-Transport-Security');}
for(const line of [`Content-Security-Policy: ${sitePolicy}`,'X-Frame-Options: DENY','Cross-Origin-Resource-Policy: same-origin','Cross-Origin-Opener-Policy: same-origin','X-Content-Type-Options: nosniff',`/services/*\n  Content-Security-Policy: ${documentPolicy}`,`/en/services/*\n  Content-Security-Policy: ${documentPolicy}`,`/faq/*\n  Content-Security-Policy: ${documentPolicy}`,`/en/faq/*\n  Content-Security-Policy: ${documentPolicy}`,`/privacy/*\n  Content-Security-Policy: ${documentPolicy}`,`/en/privacy/*\n  Content-Security-Policy: ${documentPolicy}`,`${profilePath}\n  ! Content-Security-Policy`])expect(preview).toContain(line);
const production=headersFile('https://www.example.com','');expect(production).toContain('Strict-Transport-Security: max-age=63072000; includeSubDomains; preload');expect(production).not.toContain('noindex');expect(securityHeaders('https://www.example.com')).not.toHaveProperty('X-Robots-Tag');
const robots=await readFile('dist/robots.txt','utf8'),open=robots.indexOf('User-agent: *');
for(const agent of blockedCrawlers)expect(robots.indexOf(`User-agent: ${agent}\n`)).toBeGreaterThan(-1);
expect(robots.slice(0,open)).toContain('Disallow: /');expect(robots.slice(open)).toContain('Allow: /');expect(robots.slice(open)).not.toContain('Disallow');
for(const agent of ['Googlebot','Bingbot','facebookexternalhit','WhatsApp','GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-SearchBot','Claude-User','anthropic-ai','Google-Extended','PerplexityBot','CCBot'])expect(robots).not.toContain(agent);
const text=await readFile('dist/.well-known/security.txt','utf8'),expires=new Date(text.match(/^Expires: (.+)$/m)[1]);
expect(text).toMatch(/^Contact: mailto:h\.darouzi@gmail\.com$/m);expect(expires.getTime()).toBeGreaterThan(Date.now());expect(expires.getTime()-Date.now()).toBeLessThan(366*864e5);

const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 // The parts list ships switched off; this suite keeps it covered for when it returns.
 await context.addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>{document.documentElement.dataset.partsTray='on';}));
 // Any blocked request, inline code or rejected feature is a failure, not a silent degradation.
 await context.addInitScript(()=>{window.violations=[];document.addEventListener('securitypolicyviolation',e=>window.violations.push(`${e.violatedDirective} ${e.blockedURI}`));});
 const page=await context.newPage(),errors=[],warnings=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(/Content.Security.Policy|Permissions.Policy|Refused to|Cross-Origin/i.test(m.text()))warnings.push(m.text());});
 const home=await page.goto(base+'/');const headers=home.headers();
 expect(headers['content-security-policy']).toBe(sitePolicy);expect(headers['x-frame-options']).toBe('DENY');expect(headers['cross-origin-opener-policy']).toBe('same-origin');expect(headers['cross-origin-resource-policy']).toBe('same-origin');expect(headers['permissions-policy']).toContain('camera=()');
 // Exercise every lazily loaded module under the policy: 3D engine, inspection, quote, tray and footer canvas.
 await page.locator('#scene-host').click({position:{x:80,y:80}});
 await expect(page.locator('#scene-host')).toHaveAttribute('data-scene','ready',{timeout:15000});await expect(page.locator('#scene-host canvas')).toHaveCount(1);
 for(const view of ['exploded','exterior','blueprint','cutaway'])await page.locator(`[data-view=${view}]`).click();
 await page.locator('.inspect-trigger').first().click();await page.locator('#zoom-in').click();await page.keyboard.press('Escape');
 await page.locator('[data-product=compressor]').click();await page.locator('#inspect-add').click();await page.locator('.site-header .quote-trigger').click();await expect(page.locator('#quote-dialog')).toBeVisible();await page.keyboard.press('Escape');
 await page.locator('#contact').scrollIntoViewIfNeeded();const field=await page.locator('.contact-field').boundingBox();
 await expect.poll(async()=>{await page.mouse.move(field.x+field.width*.3,field.y+40);await page.mouse.move(field.x+field.width*.6,field.y+80,{steps:4});return page.locator('.contact-field canvas').count();},{timeout:8000}).toBe(1);
 await page.locator('#language').click();await expect(page.locator('html')).toHaveAttribute('lang','en');
 expect(await page.evaluate(()=>window.violations)).toEqual([]);
 for(const path of ['/en/','/services/cold-rooms/','/en/services/thermal-insulation/','/privacy/','/en/privacy/','/faq/','/en/faq/']){
  const response=await page.goto(base+path);await expect(page.locator('h1')).toBeVisible();
  if(/services|privacy|faq/.test(path))expect((await response.headerValues('content-security-policy')).join(', ')).toContain(documentPolicy);
  expect(await page.evaluate(()=>window.violations)).toEqual([]);expect(await page.evaluate(()=>[...document.images].every(img=>!img.getAttribute('src')||img.loading==='lazy'||img.complete&&img.naturalWidth>0))).toBe(true);
 }
 const missing=await page.goto(base+'/missing-page/');expect(missing.status()).toBe(404);expect((await missing.headerValues('content-security-policy')).join(', ')).toContain(documentPolicy);
 const pdf=await context.request.get(base+profilePath);expect(pdf.status()).toBe(200);expect(pdf.headers()).not.toHaveProperty('content-security-policy');expect(pdf.headers()['x-frame-options']).toBe('DENY');
 const report=await context.request.get(base+'/.well-known/security.txt');expect(report.status()).toBe(200);expect(await report.text()).toContain('Contact: mailto:');
 // Another origin can neither frame the site nor display its images.
 const outsider=await browser.newPage();await outsider.setContent(`<iframe src="${base}/" width="800" height="600"></iframe><img id="hotlink" src="${base}/assets/logo.webp">`);
 await outsider.waitForTimeout(1500);
 expect(outsider.frames().slice(1).map(frame=>frame.url().startsWith(base))).toEqual([false]);
 expect(await outsider.locator('#hotlink').evaluate(img=>img.naturalWidth)).toBe(0);
 await outsider.close();
 expect(errors).toEqual([]);expect(warnings).toEqual([]);
 console.log('PASS: strict CSP with zero violations across the 3D engine, inspection, quote, tray, footer canvas, language switch, guides and 404; script-free guides; framing and hotlinking refused; PDF viewer unaffected; security.txt and crawler rules published.');
}finally{await browser.close();}
