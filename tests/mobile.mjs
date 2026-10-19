import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const base=process.env.TEST_URL||'http://localhost:4173';
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('darouzi-quality','lite');}});
 const page=await context.newPage(),engine=[],errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/room-scene.*\.js/.test(r.url()))engine.push(r.url());});
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.goto(base);await expect(page.locator('html')).toHaveAttribute('data-performance','lite');await expect(page.locator('#mobile-dock')).toBeHidden();
 await expect(page.locator('#render-quality')).toContainText('3D');await expect(page.locator('#rotate-left')).toBeHidden();
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:'test-results/mobile-final-ar.png'});
 // Direct WhatsApp chat: reachable from the first screen, above the dock, and out of the way of dialogs, menus and typing.
 const fab=page.locator('#whatsapp-fab');await expect(fab).toBeVisible();await expect(fab).toHaveAttribute('target','_blank');await expect(fab).toHaveAttribute('rel',/noopener/);
 expect(decodeURIComponent(await fab.getAttribute('href'))).toBe('https://wa.me/971506497817?text=مرحباً درعوزي، أود الاستفسار عن مشروع تبريد.');
 const fabBox=await fab.boundingBox();expect(fabBox.width).toBeGreaterThanOrEqual(44);expect(fabBox.x+fabBox.width/2).toBeLessThan(195);
 await page.locator('#products').evaluate(e=>scrollTo({top:e.offsetTop,behavior:'instant'}));await expect(page.locator('#mobile-dock')).toBeVisible();
 await expect.poll(async()=>(await fab.boundingBox()).y+56).toBeLessThanOrEqual((await page.locator('#mobile-dock').boundingBox()).y);
 await page.locator('#catalog-search').focus();await expect(fab).toBeHidden();await page.locator('#catalog-search').blur();await expect(fab).toBeVisible();
 await page.locator('.menu-toggle').tap();await expect(fab).toBeHidden();await page.locator('.menu-toggle').tap();await expect(fab).toBeVisible();
 await page.locator('.inspect-trigger').first().tap();await expect(page.locator('#product-dialog')).toBeVisible();await expect(fab).toBeHidden();await page.keyboard.press('Escape');await expect(fab).toBeVisible();
 await page.locator('#language').tap();await expect(fab).toHaveAttribute('aria-label','Chat with us on WhatsApp');expect(decodeURIComponent(await fab.getAttribute('href'))).toContain('Hello HMD Darouzi');await page.locator('#language').tap();await expect(page.locator('html')).toHaveAttribute('lang','ar');
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
 await page.locator('[data-view=blueprint]').tap();await expect(page.locator('#blueprint-panel')).toBeVisible();
 await page.locator('[data-blueprint-part=cooling]').tap();await expect(page.locator('#component-note')).toBeVisible();await page.locator('#close-component').tap();
 await page.locator('.hero-actions a[href="#room-builder"]').tap();await page.locator('#room-width').fill('6.5');await expect(page.locator('.blueprint-size')).toHaveText('6.5 × 4 m');
 await page.locator('.builder-close').tap();await expect(page.locator('.hero-actions a[href="#room-builder"]')).toBeFocused();
 for(const width of [320,360,390,430]){
  await page.setViewportSize({width,height:844});
  for(const language of ['en','ar']){
   if(await page.locator('html').getAttribute('lang')!==language)await page.locator('#language').tap();
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const hero=await page.locator('.hero-content').boundingBox(),stage=await page.locator('.room-stage').boundingBox(),views=await page.locator('.view-switch').boundingBox(),climate=await page.locator('.climate-control').boundingBox();
   expect(hero.y+hero.height).toBeLessThanOrEqual(stage.y);expect(stage.y+stage.height).toBeLessThanOrEqual(views.y);expect(views.y+views.height).toBeLessThanOrEqual(climate.y);
   for(const selector of ['#language','.menu-toggle','#door-toggle','.view-switch button','[data-blueprint-part]', '#cooling-inquiry','.filter','.product-add','.tray-quantity button']){
    const sizes=await page.locator(selector).evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().height).map(e=>e.getBoundingClientRect().height));for(const height of sizes)expect(height).toBeGreaterThanOrEqual(44);
   }
   await page.locator('#solutions').evaluate(e=>scrollTo({top:e.offsetTop-80,behavior:'instant'}));await expect(page.locator('#mobile-dock')).toBeVisible();
   await page.locator('[data-cooling=food]').tap();await expect(page.locator('#cooling-result')).toBeVisible();
   const before=await page.locator('#solution-tabs').boundingBox();await page.locator('#tab-transport').tap();const after=await page.locator('#solution-tabs').boundingBox();expect(after.height).toBe(before.height);
   await expect.poll(()=>page.evaluate(()=>{const strip=document.querySelector('#solution-tabs').getBoundingClientRect(),tab=document.querySelector('#tab-transport').getBoundingClientRect();return tab.left>=strip.left-1&&tab.right<=strip.right+1&&tab.width>2*document.querySelector('#tab-cold').getBoundingClientRect().width;})).toBe(true);
   await page.locator('#mobile-dock [href="#products"]').tap();await expect(page.locator('#products-title')).toBeFocused();
   await page.locator('[data-filter=insulation]').tap();await expect(page.locator('.product-card')).toHaveCount(3);await page.locator('[data-add-part=hardware]').tap();
   await page.locator('#mobile-dock [href="#parts-tray"]').tap();await expect(page.locator('#tray-dialog-title')).toBeFocused();await expect(page.locator('[data-tray-item=hardware]')).toBeVisible();
   await page.locator('#tray-note-hardware').fill('Phone inquiry');await expect(page.locator('#mobile-dock')).toBeHidden();await page.locator('#tray-dialog-title').tap();await expect(page.locator('#mobile-dock')).toBeHidden();
   await page.locator('#tray-submit').tap();await expect(page.locator('#quote-dialog')).toBeVisible();await expect(page.locator('#mobile-dock')).toBeHidden();
   for(const selector of ['#quote-form input','#quote-form select','#quote-form textarea']){const sizes=await page.locator(selector).evaluateAll(es=>es.map(e=>parseFloat(getComputedStyle(e).fontSize)));for(const size of sizes)expect(size).toBeGreaterThanOrEqual(16);}
   const box=await page.locator('#quote-dialog').boundingBox();expect(box.width).toBe(width);expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThanOrEqual(845);
   await page.locator('.dialog-close').tap();await expect(page.locator('#tray-dialog')).toBeVisible();await expect(page.locator('#tray-submit')).toBeFocused();await page.locator('#tray-keep-browsing').tap();
  }
 }
 await page.setViewportSize({width:390,height:844});await page.locator('#language').tap();
 await page.locator('.menu-toggle').tap();await expect(page.locator('#mobile-menu')).toBeVisible();await expect(page.locator('#mobile-dock')).toBeHidden();await page.locator('#mobile-menu a[href="#installation"]').tap();await expect(page.locator('#mobile-menu')).toBeHidden();await page.locator('.installation-pin[data-installation-part="1"]').tap();await expect(page.locator('#installation-component')).toHaveText('Insulated panels');
 await page.locator('#mobile-dock [href="#products"]').tap();await page.locator('[data-filter=all]').tap();await page.locator('[data-product=compressor]').tap();await expect(page.locator('#product-dialog')).toBeVisible();await expect(page.locator('#mobile-dock')).toBeHidden();await page.locator('#inspect-add').tap();await expect(page.locator('#product-dialog')).not.toBeVisible();await expect(page.locator('[data-product=compressor]')).toBeFocused();
 await page.locator('#mobile-dock [href="#parts-tray"]').tap();await page.locator('#tray-submit').tap();await page.locator('[name=name]').fill('Phone visitor');await page.locator('[name=phone]').fill('123456789');
 await page.evaluate(()=>{window.handoffs=[];document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&(a.href.startsWith('mailto:')||a.href.startsWith('https://wa.me/'))){window.handoffs.push(a.href);e.preventDefault();}},true);});
 await page.locator('#whatsapp-quote').tap();await page.locator('#email-quote').tap();expect(await page.evaluate(()=>window.handoffs.length)).toBe(2);await page.locator('.dialog-close').tap();await page.locator('#tray-keep-browsing').tap();
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 expect(engine).toEqual([]);
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.locator('[data-view=cutaway]').tap();await page.screenshot({path:'test-results/mobile-final-en.png'});
 // An explicit choice still activates live 3D and can immediately release it.
 await page.locator('#render-quality').tap();await expect(page.locator('#scene-host')).toHaveAttribute('data-scene','ready',{timeout:20000});await page.locator('#render-quality').tap();await expect(page.locator('#scene-host canvas')).toHaveCount(0);
 await page.setViewportSize({width:844,height:390});await expect(page.locator('#mobile-dock')).toBeHidden();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
 console.log('PASS: phone touch flow at 4× CPU slowdown, direct WhatsApp chat above the dock, saved lightweight preview, 320–430px bilingual layouts, desktop-style expanding solution strip, large controls, dock navigation/focus, keyboard-aware visibility, full-width sheets, readable form inputs, product/tray/blueprint interactions, both message handoffs, accessibility, no 3D download in light mode and 3D switching.');
}finally{await browser.close();}
