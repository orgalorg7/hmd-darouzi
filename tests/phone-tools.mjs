import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const browser=await chromium.launch({channel:'chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const base=process.env.TEST_URL||'http://localhost:4173';
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 await context.addInitScript(()=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('darouzi-quality','lite');}});
 const page=await context.newPage(),errors=[],engine=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/room-scene.*\.js/.test(r.url()))engine.push(r.url());});
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.goto(base);await page.locator('#language').tap();await page.locator('#room-expand').tap();await expect(page.locator('#room-workspace')).toBeVisible();
 await expect(page.locator('#room-workspace #room-stage')).toHaveCount(1);await expect(page.locator('#room-stage')).toHaveCount(1);
 async function swipe(x1,y1,x2,y2){
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y:y1}]});
  for(let i=1;i<=6;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x1+(x2-x1)*i/6,y:y1+(y2-y1)*i/6}]});await page.waitForTimeout(20);}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  // Chromium suppresses taps immediately after injected swipes, even on a plain page.
  await page.waitForTimeout(600);
 }
 let box=await page.locator('#scene-host').boundingBox();await swipe(box.x+box.width*.8,box.y+box.height*.5,box.x+box.width*.2,box.y+box.height*.5);
 await expect(page.locator('[data-view=exterior]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.scene-fallback')).toHaveAttribute('src',/exterior-open/);
 await page.locator('#door-toggle').tap();await expect(page.locator('.scene-fallback')).toHaveAttribute('src',/exterior-closed/);
 await page.locator('[data-view=blueprint]').tap();await page.locator('[data-blueprint-part=panels]').tap();await expect(page.locator('#component-note')).toBeVisible();await page.locator('#close-component').tap();
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:640});
  expect(await page.locator('#room-workspace').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  const temperature=await page.locator('#hero-temperature').boundingBox();expect(temperature.x).toBeGreaterThanOrEqual(16);expect(temperature.x+temperature.width).toBeLessThanOrEqual(width-16);
  const button=await page.locator('#workspace-configure').boundingBox();expect(button.y+button.height).toBeLessThanOrEqual(641);expect(button.y).toBeGreaterThan(0);
 }
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/phone-tools-blueprint.png'});
 const axeRoom=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axeRoom.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await page.locator('#workspace-configure').tap();await expect(page.locator('#room-workspace')).not.toBeVisible();await expect(page.locator('.lab-hero #room-stage')).toHaveCount(1);await page.locator('#room-width').fill('6');await expect(page.locator('.blueprint-size')).toHaveText('6 × 4 m');await page.locator('.builder-close').tap();
 // Restoration and repeated openings must not duplicate IDs, lose the mode or move the document.
 for(let cycle=0;cycle<3;cycle++){await page.locator('#room-expand').tap();await expect(page.locator('.blueprint-size')).toHaveText('6 × 4 m');await page.keyboard.press('Escape');await expect(page.locator('#room-expand')).toBeFocused();await expect(page.locator('#room-stage')).toHaveCount(1);await expect(page.locator('.phone-panel-placeholder')).toHaveCount(0);}
 const query=page.locator('#catalog-search');
 for(const [text,id] of [['ضاغط','compressor'],['باب','door'],['مُبَخِّر','evaporator'],['CONDENSING','condensing']]){await query.fill(text);await expect(page.locator('.product-card')).toHaveCount(1);await expect(page.locator(`[data-product="${id}"]`)).toBeVisible();}
 await query.fill('not a listed component');await expect(page.locator('#catalog-empty')).toBeVisible();await page.locator('#catalog-reset').tap();await expect(page.locator('.product-card')).toHaveCount(8);await expect(query).toHaveValue('');
 await query.fill('compressor');await page.locator('[data-filter=insulation]').tap();await expect(page.locator('#catalog-empty')).toBeVisible();await page.locator('#catalog-reset').tap();
 await query.fill('door');await page.locator('#language').tap();await expect(query).toHaveValue('door');await expect(page.locator('.product-card')).toHaveCount(2);await page.locator('#catalog-search-clear').tap();
 await query.fill('compressor');await page.locator('[data-add-part=compressor]').tap();await expect(page.locator('[data-open-tray]')).toBeVisible();
 const scrollBefore=await page.evaluate(()=>scrollY);await page.locator('[data-open-tray]').tap();await expect(page.locator('#tray-dialog')).toBeVisible();await expect(page.locator('#tray-dialog-title')).toBeFocused();await expect(page.locator('#tray-status')).toBeEmpty();
 await page.locator('#tray-note-compressor').fill('Model requested & dimensions');await page.locator('#tray-quantity-compressor').fill('3');await page.locator('#tray-quantity-compressor').press('Tab');
 await page.locator('#tray-submit').tap();await expect(page.locator('#tray-dialog')).not.toBeVisible();await expect(page.locator('#quote-parts')).toContainText('3 ×');await expect(page.locator('#quote-parts')).toContainText('Model requested & dimensions');
 await page.locator('[name=name]').fill('Phone visitor');await page.locator('[name=phone]').fill('123456789');
 await page.evaluate(()=>{window.handoffs=[];document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&(a.href.startsWith('mailto:')||a.href.startsWith('https://wa.me/'))){window.handoffs.push(a.href);e.preventDefault();}},true);});
 await page.locator('#whatsapp-quote').tap();await page.locator('#email-quote').tap();expect(await page.evaluate(()=>window.handoffs.length)).toBe(2);
 await page.locator('.dialog-close').tap();await expect(page.locator('#tray-dialog')).toBeVisible();await expect(page.locator('#tray-submit')).toBeFocused();
 const axeTray=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axeTray.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await page.screenshot({path:'test-results/phone-tools-tray.png'});await page.locator('#tray-keep-browsing').tap();expect(Math.abs(await page.evaluate(()=>scrollY)-scrollBefore)).toBeLessThan(4);await expect(page.locator('#catalog-search')).toHaveValue('compressor');await expect(page.locator('#products #parts-tray')).toHaveCount(1);await expect(page.locator('#tray-quantity-compressor')).toHaveValue('3');
 await page.locator('#mobile-dock [href="#parts-tray"]').tap();box=await page.locator('.sheet-grip').boundingBox();await swipe(box.x+box.width/2,box.y+10,box.x+box.width/2,box.y+90);await expect(page.locator('#tray-dialog')).not.toBeVisible();
 await page.locator('#mobile-dock [href="#parts-tray"]').tap();await page.locator('[data-tray-action=remove]').tap();await expect(page.locator('#tray-empty')).toBeVisible();await expect(page.locator('#tray-submit')).toBeDisabled();await expect(page.locator('#tray-dialog-title')).toBeFocused();await page.keyboard.press('Escape');
 // A resize restores moved content before leaving the phone layout.
 await page.locator('#mobile-dock [href="#parts-tray"]').tap();await page.setViewportSize({width:1024,height:900});await expect(page.locator('#tray-dialog')).not.toBeVisible();await expect(page.locator('#products #parts-tray')).toHaveCount(1);
 expect(engine).toEqual([]);expect(errors).toEqual([]);
 console.log('PASS: phone fullscreen room, real touch swipes, blueprint/door state, repeated restoration, 320–430px short-screen layouts, Arabic/English search and empty state, drawer editing, quote return, preserved browsing position, grip dismissal, resize cleanup, accessibility and zero 3D requests.');
}finally{await browser.close();}
