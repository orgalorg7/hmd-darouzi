// Link-preview cards (WhatsApp, Telegram, Facebook, X, iMessage): one 1200×630 JPEG per page and language.
// Run `npm run share:build` after changing service names, headings or photos; the output is committed under public/.
import {mkdir,readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from '@playwright/test';
import {services} from '../src/content.js';

const root = resolve(import.meta.dirname, '..'), out = resolve(root, 'public/assets/share');
// Sharper originals where the site's own copy is small; product photos on white keep their white card.
const photos = {cold:'source-photos/facebook/cold-store-4800-corridor.jpg',chillers:'public/assets/service-chillers.webp',towers:'public/assets/service-towers.webp',ice:'public/assets/condensing.webp',transport:'public/assets/truck.webp',insulation:'public/assets/panels.webp'};
// Inlined as data URLs: a page built with setContent may not load local files.
const types = {'.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'}, cache = {};
for (const path of ['public/fonts/arabic-400.woff2','public/fonts/arabic-600.woff2','public/fonts/manrope-600.woff2','public/assets/logo.webp','public/assets/room-preview.webp',...Object.values(photos)])
 cache[path] = `data:${types[extname(path)]};base64,${(await readFile(resolve(root, path))).toString('base64')}`;
const file = path => cache[path];
const copy = {
 ar:{brand:'درعوزي للتبريد',place:'حلب، سوريا',home:'هندسة البرودة. بين يديك.',chips:['غرف تبريد وتجميد','شيلرات وأبراج تبريد','معامل ثلج ونقل مبرد'],cta:'اطلب عرض سعرك عبر واتساب',design:'صمّم غرفتك 3D'},
 en:{brand:'HMD Darouzi',place:'Aleppo, Syria',home:'Refrigeration, engineered.',chips:['Cold & freezer rooms','Chillers & cooling towers','Ice plants & transport'],cta:'Get a quote on WhatsApp',design:'Design your room in 3D'}
};

function card({lang, service}) {
 const c = copy[lang], ar = lang === 'ar', contain = service?.contain;
 const visual = service
  ? `<div class="photo${contain ? ' contain' : ''}"><img src="${file(photos[service.id])}" alt=""></div>`
  : `<div class="room"><div class="glow"></div><img src="${file('public/assets/room-preview.webp')}" alt=""><span class="badge range" dir="ltr">❄ −40°C → +15°C</span><span class="badge three">3D</span></div>`;
 const text = service
  ? `<p class="eyebrow">${service.eyebrow}</p><h1 class="service">${service[lang]}</h1><p class="tagline">${(ar ? service.titleAr : service.titleEn).replace('<br>', ' ')}</p>`
  : `<p class="eyebrow">INDUSTRIAL REFRIGERATION · ${ar ? 'ALEPPO' : 'SYRIA'}</p><h1>${c.brand}</h1><p class="tagline">${c.home}</p><ul>${c.chips.map(chip => `<li>${chip}</li>`).join('')}</ul>`;
 return `<!doctype html><html lang="${lang}" dir="${ar ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
@font-face{font-family:Plex;src:url('${file('public/fonts/arabic-400.woff2')}');font-weight:400}
@font-face{font-family:Plex;src:url('${file('public/fonts/arabic-600.woff2')}');font-weight:600}
@font-face{font-family:Manrope;src:url('${file('public/fonts/manrope-600.woff2')}');font-weight:600}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;height:630px;overflow:hidden;font-family:${ar ? 'Plex,Manrope' : 'Manrope,Plex'};color:#fff;
 background:radial-gradient(circle at ${ar ? '22%' : '78%'} 45%,#2a6cff55,transparent 45%),linear-gradient(135deg,#071a3a,#0d2f6e 55%,#123f94);display:grid;grid-template-columns:640px 560px;position:relative}
body::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(90deg,#ffffff08 0 1px,transparent 1px 60px),repeating-linear-gradient(0deg,#ffffff08 0 1px,transparent 1px 60px);mask:linear-gradient(${ar ? '270deg' : '90deg'},#000 0,transparent 75%)}
.text{position:relative;padding:50px 60px 48px;display:flex;flex-direction:column;gap:14px}
.logo{background:#fff;border-radius:18px;padding:12px 20px;align-self:flex-start;box-shadow:0 10px 30px #0006}.logo img{height:48px;display:block}
.eyebrow{font:600 16px Manrope;letter-spacing:.16em;color:#8fb8ff;margin-top:8px}
h1{font-weight:600;font-size:${ar ? 86 : 74}px;line-height:1.1;white-space:nowrap;letter-spacing:${ar ? 0 : '-.03em'}}
h1.service{font-size:${ar ? 70 : 60}px;line-height:1.15;white-space:normal}
.tagline{font-weight:600;font-size:${ar ? 34 : 30}px;color:#9cc6ff;line-height:1.35}
ul{list-style:none;display:flex;flex-wrap:wrap;gap:10px;margin-top:6px}
li{font-size:${ar ? 21 : 18}px;font-weight:600;padding:8px 16px;border-radius:99px;background:#ffffff14;border:1px solid #ffffff30}
.foot{margin-top:auto;display:flex;align-items:center;gap:16px;font-size:${ar ? 23 : 20}px;font-weight:600;white-space:nowrap}
.cta{background:#25d366;color:#05301a;padding:12px 22px;border-radius:99px;display:flex;align-items:center;gap:10px}
.cta svg{width:26px;height:26px}.place{color:#b9cdee;font-weight:400}
.visual{position:relative;display:grid;place-items:center}
.room{position:relative;width:560px}.room img{width:100%;display:block;filter:drop-shadow(0 30px 40px #0009)}
.glow{position:absolute;inset:18% 8% 0;background:radial-gradient(ellipse,#5ea0ff70,transparent 65%);filter:blur(10px)}
.badge{position:absolute;font:600 24px Manrope,Plex;padding:10px 18px;border-radius:14px;background:#ffffffe6;color:#0d2f6e;box-shadow:0 12px 30px #0006}
.range{top:4%;${ar ? 'left' : 'right'}:2%}.three{bottom:14%;${ar ? 'right' : 'left'}:4%;background:#174ee8;color:#fff;font-size:30px;padding:10px 20px}
.photo{position:absolute;inset:0;overflow:hidden}.photo img{width:100%;height:100%;object-fit:cover;display:block}
.photo::after{content:'';position:absolute;inset:0;background:linear-gradient(${ar ? '90deg' : '270deg'},transparent 55%,#0d2f6e)}
.photo.contain{inset:56px 48px;border-radius:28px;background:#fff;box-shadow:0 24px 50px #0008}.photo.contain img{object-fit:contain;padding:36px}.photo.contain::after{display:none}
</style></head><body><div class="text"><div class="logo"><img src="${file('public/assets/logo.webp')}" alt=""></div>${text}
<div class="foot"><span class="cta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>${service ? c.cta : c.design}</span><span class="place">${c.place}</span></div></div>
<div class="visual">${visual}</div></body></html>`;
}

await mkdir(out, {recursive:true});
const browser = await chromium.launch({channel:'chrome'});
try {
 const page = await browser.newPage({viewport:{width:1200,height:630}});
 for (const lang of ['ar', 'en']) for (const service of [null, ...services]) {
  await page.setContent(card({lang, service}), {waitUntil:'load'});
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path:resolve(out, `${service?.id || 'home'}-${lang}.jpg`), type:'jpeg', quality:86});
 }
} finally { await browser.close(); }
console.log(`Share cards: ${2 * (services.length + 1)} images in public/assets/share/`);
